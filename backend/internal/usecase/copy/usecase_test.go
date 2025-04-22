package copy_usecase

import (
	"context"
	"errors"
	"os"
	"testing"

	"github.com/sashabaranov/go-openai"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
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
		name    string
		input   CreateCopyInput
		want    *entity.Copy
		wantErr bool
	}{
		{
			name: "正常系",
			input: CreateCopyInput{
				ProductName:     "テスト商品",
				ProductFeatures: "高品質、使いやすい",
				Target:          "20-30代女性",
				Channel:         entity.ChannelSNS,
				Tone:            entity.ToneCasual,
				IsPublished:     true,
			},
			want: &entity.Copy{
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
			wantErr: false,
		},
		{
			name: "異常系_リポジトリエラー",
			input: CreateCopyInput{
				ProductName:     "テスト商品",
				ProductFeatures: "高品質、使いやすい",
				Target:          "20-30代女性",
				Channel:         entity.ChannelSNS,
				Tone:            entity.ToneCasual,
				IsPublished:     true,
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockRepo := new(mockCopyRepository)
			mockOpenAI := new(mockOpenAIClient)

			if tt.wantErr {
				mockOpenAI.On("CreateChatCompletion", mock.Anything, mock.Anything).Return(mockResponse, nil)
				mockRepo.On("Create", mock.Anything, mock.Anything).Return(errors.New("repository error"))
			} else {
				mockOpenAI.On("CreateChatCompletion", mock.Anything, mock.Anything).Return(mockResponse, nil)
				mockRepo.On("Create", mock.Anything, mock.Anything).Return(nil)
			}

			// 環境変数の設定
			os.Setenv("OPENAI_API_KEY", "dummy-key")

			// ユースケースの初期化
			u := &useCase{
				repo:         mockRepo,
				openaiClient: mockOpenAI,
			}

			// テスト実行
			got, err := u.CreateCopy(context.Background(), tt.input)

			// アサーション
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestGetCopy(t *testing.T) {
	tests := []struct {
		name    string
		id      int
		want    *entity.Copy
		wantErr bool
	}{
		{
			name: "正常系",
			id:   1,
			want: &entity.Copy{
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
			wantErr: false,
		},
		{
			name:    "異常系_存在しないID",
			id:      999,
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockRepo := new(mockCopyRepository)
			if tt.wantErr {
				mockRepo.On("Get", mock.Anything, tt.id).Return(nil, errors.New("not found"))
			} else {
				mockRepo.On("Get", mock.Anything, tt.id).Return(tt.want, nil)
			}

			// ユースケースの初期化
			u := NewUseCase(mockRepo)

			// テスト実行
			got, err := u.GetCopy(context.Background(), tt.id)

			// アサーション
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestUpdateLikes(t *testing.T) {
	tests := []struct {
		name    string
		id      int
		want    *entity.Copy
		wantErr bool
	}{
		{
			name: "正常系",
			id:   1,
			want: &entity.Copy{
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
			wantErr: false,
		},
		{
			name:    "異常系_存在しないID",
			id:      999,
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockRepo := new(mockCopyRepository)
			if tt.wantErr {
				mockRepo.On("Get", mock.Anything, tt.id).Return(nil, errors.New("not found"))
			} else {
				initialCopy := *tt.want
				initialCopy.Likes = 0
				mockRepo.On("Get", mock.Anything, tt.id).Return(&initialCopy, nil)
				mockRepo.On("UpdateLikes", mock.Anything, tt.id, tt.want.Likes).Return(nil)
			}

			// ユースケースの初期化
			u := NewUseCase(mockRepo)

			// テスト実行
			got, err := u.UpdateLikes(context.Background(), tt.id)

			// アサーション
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestGetPublishedCopies(t *testing.T) {
	tests := []struct {
		name    string
		want    []*entity.Copy
		wantErr bool
	}{
		{
			name: "正常系",
			want: []*entity.Copy{
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
			wantErr: false,
		},
		{
			name:    "異常系_リポジトリエラー",
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockRepo := new(mockCopyRepository)
			if tt.wantErr {
				mockRepo.On("GetPublished", mock.Anything).Return(nil, errors.New("repository error"))
			} else {
				mockRepo.On("GetPublished", mock.Anything).Return(tt.want, nil)
			}

			// ユースケースの初期化
			u := NewUseCase(mockRepo)

			// テスト実行
			got, err := u.GetPublishedCopies(context.Background())

			// アサーション
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
