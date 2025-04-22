package copy_handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/sashabaranov/go-openai"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
	copy_usecase "github.com/takanoakira/ai-sales-copy-generator/backend/internal/usecase/copy"
)

// モックリポジトリの定義
type mockCopyRepository struct {
	mock.Mock
}

func (m *mockCopyRepository) Create(ctx context.Context, copy *entity.Copy) error {
	args := m.Called(ctx, copy)
	return args.Error(0)
}

func (m *mockCopyRepository) Get(ctx context.Context, id int) (*entity.Copy, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.Copy), args.Error(1)
}

func (m *mockCopyRepository) GetPublished(ctx context.Context) ([]*entity.Copy, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.Copy), args.Error(1)
}

func (m *mockCopyRepository) UpdateLikes(ctx context.Context, id int, likes int) error {
	args := m.Called(ctx, id, likes)
	return args.Error(0)
}

// OpenAIクライアントのモック
type mockOpenAIClient struct {
	mock.Mock
}

func (m *mockOpenAIClient) CreateChatCompletion(ctx context.Context, req openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(openai.ChatCompletionResponse), args.Error(1)
}

// OpenAIレスポンスの定義
type openAIResponse struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

// モックユースケースの定義
type mockUseCase struct {
	repo         *mockCopyRepository
	openaiClient *mockOpenAIClient
}

func (u *mockUseCase) CreateCopy(ctx context.Context, input copy_usecase.CreateCopyInput) (*entity.Copy, error) {
	// プロンプトの生成
	prompt := generatePrompt(input)

	// OpenAI APIの呼び出し
	resp, err := u.openaiClient.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
		},
	)
	if err != nil {
		return nil, err
	}

	if len(resp.Choices) == 0 {
		return nil, errors.New("no response from OpenAI")
	}

	// レスポンスの解析
	var aiResp openAIResponse
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &aiResp); err != nil {
		return nil, err
	}

	// エンティティの作成
	copy := &entity.Copy{
		Title:           aiResp.Title,
		Description:     aiResp.Description,
		ProductName:     input.ProductName,
		ProductFeatures: input.ProductFeatures,
		Target:          input.Target,
		Channel:         input.Channel,
		Tone:            input.Tone,
		Likes:           0,
		IsPublished:     input.IsPublished,
	}

	// リポジトリへの保存
	if err := u.repo.Create(ctx, copy); err != nil {
		return nil, err
	}

	return copy, nil
}

func (u *mockUseCase) GetCopy(ctx context.Context, id int) (*entity.Copy, error) {
	return u.repo.Get(ctx, id)
}

func (u *mockUseCase) GetPublishedCopies(ctx context.Context) ([]*entity.Copy, error) {
	return u.repo.GetPublished(ctx)
}

func (u *mockUseCase) UpdateLikes(ctx context.Context, id int) (*entity.Copy, error) {
	copy, err := u.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	copy.Likes++
	if err := u.repo.UpdateLikes(ctx, id, copy.Likes); err != nil {
		return nil, err
	}

	return copy, nil
}

func generatePrompt(input copy_usecase.CreateCopyInput) string {
	return `以下の情報に基づき、ターゲット『` + input.Target + `』向けに、商品『` + input.ProductName + `』（特徴: ` + input.ProductFeatures + `）の配信チャネル『` + string(input.Channel) + `』、トーン『` + string(input.Tone) + `』に最適な販促コピーを生成してください。

出力形式は以下のJSON形式でお願いします：
{
  "title": "タイトル（20文字以内）",
  "description": "本文（50〜100文字以内）"
}`
}

func setupTestRouter(h Handler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	r.POST("/api/copies", h.CreateCopy)
	r.GET("/api/copies/:id", h.GetCopy)
	r.GET("/api/copies/published", h.GetPublishedCopies)
	r.PUT("/api/copies/:id/likes", h.UpdateLikes)

	return r
}

func TestCreateCopy(t *testing.T) {
	// OpenAIのモックレスポンスを準備
	mockResponse := openai.ChatCompletionResponse{
		Choices: []openai.ChatCompletionChoice{
			{
				Message: openai.ChatCompletionMessage{
					Content: `{
						"title": "テストタイトル",
						"description": "テスト説明"
					}`,
				},
			},
		},
	}

	tests := []struct {
		name       string
		request    CreateCopyRequest
		wantStatus int
		wantBody   interface{}
		setupMock  func(*mockCopyRepository, *mockOpenAIClient)
	}{
		{
			name: "正常系",
			request: CreateCopyRequest{
				ProductName:     "テスト商品",
				ProductFeatures: "高品質、使いやすい",
				Target:          "20-30代女性",
				Channel:         entity.ChannelSNS,
				Tone:            entity.ToneCasual,
				IsPublished:     true,
			},
			wantStatus: http.StatusCreated,
			wantBody: &entity.Copy{
				Title:           "テストタイトル",
				Description:     "テスト説明",
				ProductName:     "テスト商品",
				ProductFeatures: "高品質、使いやすい",
				Target:          "20-30代女性",
				Channel:         entity.ChannelSNS,
				Tone:            entity.ToneCasual,
				Likes:           0,
				IsPublished:     true,
			},
			setupMock: func(mockRepo *mockCopyRepository, mockOpenAI *mockOpenAIClient) {
				mockOpenAI.On("CreateChatCompletion", mock.Anything, mock.Anything).Return(mockResponse, nil)
				mockRepo.On("Create", mock.Anything, mock.Anything).Return(nil)
			},
		},
		{
			name: "異常系_必須項目なし",
			request: CreateCopyRequest{
				ProductName: "",
			},
			wantStatus: http.StatusBadRequest,
			wantBody: gin.H{
				"error": "Key: 'CreateCopyRequest.ProductName' Error:Field validation for 'ProductName' failed on the 'required' tag\nKey: 'CreateCopyRequest.ProductFeatures' Error:Field validation for 'ProductFeatures' failed on the 'required' tag\nKey: 'CreateCopyRequest.Target' Error:Field validation for 'Target' failed on the 'required' tag\nKey: 'CreateCopyRequest.Channel' Error:Field validation for 'Channel' failed on the 'required' tag\nKey: 'CreateCopyRequest.Tone' Error:Field validation for 'Tone' failed on the 'required' tag",
			},
			setupMock: func(mockRepo *mockCopyRepository, mockOpenAI *mockOpenAIClient) {},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockRepo := new(mockCopyRepository)
			mockOpenAI := new(mockOpenAIClient)
			tt.setupMock(mockRepo, mockOpenAI)

			// ハンドラーの初期化
			h := &handler{
				usecase: &mockUseCase{
					repo:         mockRepo,
					openaiClient: mockOpenAI,
				},
			}
			router := setupTestRouter(h)

			// リクエストの作成
			body, _ := json.Marshal(tt.request)
			req := httptest.NewRequest(http.MethodPost, "/api/copies", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			// リクエストの実行
			router.ServeHTTP(rec, req)

			// アサーション
			assert.Equal(t, tt.wantStatus, rec.Code)

			var response interface{}
			if tt.wantStatus == http.StatusCreated {
				var copy entity.Copy
				json.Unmarshal(rec.Body.Bytes(), &copy)
				response = &copy
			} else {
				var errorResponse gin.H
				json.Unmarshal(rec.Body.Bytes(), &errorResponse)
				response = errorResponse
			}

			assert.Equal(t, tt.wantBody, response)
		})
	}
}

func TestGetCopy(t *testing.T) {
	tests := []struct {
		name       string
		id         string
		wantStatus int
		wantBody   interface{}
	}{
		{
			name:       "正常系",
			id:         "1",
			wantStatus: http.StatusOK,
			wantBody: &entity.Copy{
				ID:              1,
				Title:           "テストタイトル",
				Description:     "テスト説明",
				ProductName:     "テスト商品",
				ProductFeatures: "高品質、使いやすい",
				Target:          "20-30代女性",
				Channel:         entity.ChannelSNS,
				Tone:            entity.ToneCasual,
				Likes:           0,
				IsPublished:     true,
			},
		},
		{
			name:       "異常系_無効なID",
			id:         "invalid",
			wantStatus: http.StatusBadRequest,
			wantBody: gin.H{
				"error": "invalid id parameter",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockRepo := new(mockCopyRepository)
			if tt.wantStatus == http.StatusOK {
				mockRepo.On("Get", mock.Anything, 1).Return(tt.wantBody, nil)
			}

			// ハンドラーの初期化
			h := NewHandler(mockRepo)
			router := setupTestRouter(h)

			// リクエストの作成
			req := httptest.NewRequest(http.MethodGet, "/api/copies/"+tt.id, nil)
			rec := httptest.NewRecorder()

			// リクエストの実行
			router.ServeHTTP(rec, req)

			// アサーション
			assert.Equal(t, tt.wantStatus, rec.Code)

			var response interface{}
			if tt.wantStatus == http.StatusOK {
				var copy entity.Copy
				json.Unmarshal(rec.Body.Bytes(), &copy)
				response = &copy
			} else {
				var errorResponse gin.H
				json.Unmarshal(rec.Body.Bytes(), &errorResponse)
				response = errorResponse
			}

			assert.Equal(t, tt.wantBody, response)
		})
	}
}

func TestGetPublishedCopies(t *testing.T) {
	tests := []struct {
		name       string
		wantStatus int
		wantBody   interface{}
		setupMock  func(*mockCopyRepository)
	}{
		{
			name:       "正常系",
			wantStatus: http.StatusOK,
			wantBody: []*entity.Copy{
				{
					ID:              1,
					Title:           "テストタイトル1",
					Description:     "テスト説明1",
					ProductName:     "テスト商品1",
					ProductFeatures: "高品質、使いやすい",
					Target:          "20-30代女性",
					Channel:         entity.ChannelSNS,
					Tone:            entity.ToneCasual,
					Likes:           0,
					IsPublished:     true,
				},
				{
					ID:              2,
					Title:           "テストタイトル2",
					Description:     "テスト説明2",
					ProductName:     "テスト商品2",
					ProductFeatures: "高品質、使いやすい",
					Target:          "20-30代女性",
					Channel:         entity.ChannelSNS,
					Tone:            entity.ToneCasual,
					Likes:           0,
					IsPublished:     true,
				},
			},
			setupMock: func(mockRepo *mockCopyRepository) {
				mockRepo.On("GetPublished", mock.Anything).Return([]*entity.Copy{
					{
						ID:              1,
						Title:           "テストタイトル1",
						Description:     "テスト説明1",
						ProductName:     "テスト商品1",
						ProductFeatures: "高品質、使いやすい",
						Target:          "20-30代女性",
						Channel:         entity.ChannelSNS,
						Tone:            entity.ToneCasual,
						Likes:           0,
						IsPublished:     true,
					},
					{
						ID:              2,
						Title:           "テストタイトル2",
						Description:     "テスト説明2",
						ProductName:     "テスト商品2",
						ProductFeatures: "高品質、使いやすい",
						Target:          "20-30代女性",
						Channel:         entity.ChannelSNS,
						Tone:            entity.ToneCasual,
						Likes:           0,
						IsPublished:     true,
					},
				}, nil)
			},
		},
		{
			name:       "異常系_リポジトリエラー",
			wantStatus: http.StatusInternalServerError,
			wantBody: gin.H{
				"error": "internal server error",
			},
			setupMock: func(mockRepo *mockCopyRepository) {
				mockRepo.On("GetPublished", mock.Anything).Return(nil, errors.New("repository error"))
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockRepo := new(mockCopyRepository)
			tt.setupMock(mockRepo)

			// ハンドラーの初期化
			h := NewHandler(mockRepo)
			router := setupTestRouter(h)

			// リクエストの作成
			req := httptest.NewRequest(http.MethodGet, "/api/copies/published", nil)
			rec := httptest.NewRecorder()

			// リクエストの実行
			router.ServeHTTP(rec, req)

			// アサーション
			assert.Equal(t, tt.wantStatus, rec.Code)

			var response interface{}
			if tt.wantStatus == http.StatusOK {
				var copies []*entity.Copy
				json.Unmarshal(rec.Body.Bytes(), &copies)
				response = copies
			} else {
				var errorResponse gin.H
				json.Unmarshal(rec.Body.Bytes(), &errorResponse)
				response = errorResponse
			}

			assert.Equal(t, tt.wantBody, response)
		})
	}
}

func TestUpdateLikes(t *testing.T) {
	tests := []struct {
		name       string
		id         string
		wantStatus int
		wantBody   interface{}
		setupMock  func(*mockCopyRepository)
	}{
		{
			name:       "正常系",
			id:         "1",
			wantStatus: http.StatusOK,
			wantBody: &entity.Copy{
				ID:              1,
				Title:           "テストタイトル",
				Description:     "テスト説明",
				ProductName:     "テスト商品",
				ProductFeatures: "高品質、使いやすい",
				Target:          "20-30代女性",
				Channel:         entity.ChannelSNS,
				Tone:            entity.ToneCasual,
				Likes:           1,
				IsPublished:     true,
			},
			setupMock: func(mockRepo *mockCopyRepository) {
				initialCopy := &entity.Copy{
					ID:              1,
					Title:           "テストタイトル",
					Description:     "テスト説明",
					ProductName:     "テスト商品",
					ProductFeatures: "高品質、使いやすい",
					Target:          "20-30代女性",
					Channel:         entity.ChannelSNS,
					Tone:            entity.ToneCasual,
					Likes:           0,
					IsPublished:     true,
				}
				mockRepo.On("Get", mock.Anything, 1).Return(initialCopy, nil)
				mockRepo.On("UpdateLikes", mock.Anything, 1, 1).Return(nil)
			},
		},
		{
			name:       "異常系_無効なID",
			id:         "invalid",
			wantStatus: http.StatusBadRequest,
			wantBody: gin.H{
				"error": "invalid id parameter",
			},
			setupMock: func(mockRepo *mockCopyRepository) {},
		},
		{
			name:       "異常系_存在しないID",
			id:         "999",
			wantStatus: http.StatusNotFound,
			wantBody: gin.H{
				"error": "copy not found",
			},
			setupMock: func(mockRepo *mockCopyRepository) {
				mockRepo.On("Get", mock.Anything, 999).Return(nil, errors.New("not found"))
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockRepo := new(mockCopyRepository)
			tt.setupMock(mockRepo)

			// ハンドラーの初期化
			h := NewHandler(mockRepo)
			router := setupTestRouter(h)

			// リクエストの作成
			req := httptest.NewRequest(http.MethodPut, "/api/copies/"+tt.id+"/likes", nil)
			rec := httptest.NewRecorder()

			// リクエストの実行
			router.ServeHTTP(rec, req)

			// アサーション
			assert.Equal(t, tt.wantStatus, rec.Code)

			var response interface{}
			if tt.wantStatus == http.StatusOK {
				var copy entity.Copy
				json.Unmarshal(rec.Body.Bytes(), &copy)
				response = &copy
			} else {
				var errorResponse gin.H
				json.Unmarshal(rec.Body.Bytes(), &errorResponse)
				response = errorResponse
			}

			assert.Equal(t, tt.wantBody, response)
		})
	}
}
