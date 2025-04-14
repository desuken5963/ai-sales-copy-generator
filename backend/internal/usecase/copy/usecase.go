package copy_usecase

import (
	"context"
	"encoding/json"
	"errors"
	"os"

	"github.com/sashabaranov/go-openai"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/repository"
)

type UseCase interface {
	CreateCopy(ctx context.Context, input CreateCopyInput) (*entity.Copy, error)
	GetCopy(ctx context.Context, id int) (*entity.Copy, error)
}

type useCase struct {
	repo repository.CopyRepository
}

type CreateCopyInput struct {
	ProductName     string
	ProductFeatures string
	Target          string
	Channel         entity.Channel
	Tone            entity.Tone
	IsPublished     bool
}

type openAIResponse struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

func NewUseCase(repo repository.CopyRepository) UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) CreateCopy(ctx context.Context, input CreateCopyInput) (*entity.Copy, error) {
	// OpenAIクライアントの初期化
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	// プロンプトの生成
	prompt := generatePrompt(input)

	// OpenAI APIの呼び出し
	resp, err := client.CreateChatCompletion(
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

func generatePrompt(input CreateCopyInput) string {
	return `以下の情報に基づき、ターゲット『` + input.Target + `』向けに、商品『` + input.ProductName + `』（特徴: ` + input.ProductFeatures + `）の配信チャネル『` + string(input.Channel) + `』、トーン『` + string(input.Tone) + `』に最適な販促コピーを生成してください。

出力形式は以下のJSON形式でお願いします：
{
  "title": "タイトル（20文字以内）",
  "description": "本文（50〜100文字以内）"
}`
}

func (u *useCase) GetCopy(ctx context.Context, id int) (*entity.Copy, error) {
	copy, err := u.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	return copy, nil
}
