package repository

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
)

// MockCopyRepository は CopyRepository のモック実装
type MockCopyRepository struct {
	mock.Mock
}

func (m *MockCopyRepository) Create(ctx context.Context, copy *entity.Copy) error {
	args := m.Called(ctx, copy)
	return args.Error(0)
}

func (m *MockCopyRepository) Get(ctx context.Context, id int) (*entity.Copy, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.Copy), args.Error(1)
}

func (m *MockCopyRepository) GetPublished(ctx context.Context) ([]*entity.Copy, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.Copy), args.Error(1)
}

func (m *MockCopyRepository) UpdateLikes(ctx context.Context, id int, likes int) error {
	args := m.Called(ctx, id, likes)
	return args.Error(0)
}

func TestCopyRepository(t *testing.T) {
	// テスト用のコンテキスト
	ctx := context.Background()

	t.Run("Create", func(t *testing.T) {
		// テスト用のコピーエンティティ
		testCopy := &entity.Copy{
			Title:           "テストタイトル",
			Description:     "テスト説明",
			ProductName:     "テスト商品",
			ProductFeatures: "高品質、使いやすい",
			Target:          "20-30代女性",
			Channel:         entity.ChannelSNS,
			Tone:            entity.ToneCasual,
			IsPublished:     true,
		}

		t.Run("正常系", func(t *testing.T) {
			mockRepo := new(MockCopyRepository)
			mockRepo.On("Create", ctx, testCopy).Return(nil)

			err := mockRepo.Create(ctx, testCopy)

			assert.NoError(t, err)
			mockRepo.AssertExpectations(t)
		})

		t.Run("異常系_エラー発生", func(t *testing.T) {
			mockRepo := new(MockCopyRepository)
			mockRepo.On("Create", ctx, testCopy).Return(assert.AnError)

			err := mockRepo.Create(ctx, testCopy)

			assert.Error(t, err)
			mockRepo.AssertExpectations(t)
		})
	})

	t.Run("Get", func(t *testing.T) {
		// テスト用のコピーエンティティ
		testCopy := &entity.Copy{
			ID:              1,
			Title:           "テストタイトル",
			Description:     "テスト説明",
			ProductName:     "テスト商品",
			ProductFeatures: "高品質、使いやすい",
			Target:          "20-30代女性",
			Channel:         entity.ChannelSNS,
			Tone:            entity.ToneCasual,
			IsPublished:     true,
		}

		t.Run("正常系", func(t *testing.T) {
			mockRepo := new(MockCopyRepository)
			mockRepo.On("Get", ctx, 1).Return(testCopy, nil)

			got, err := mockRepo.Get(ctx, 1)

			assert.NoError(t, err)
			assert.Equal(t, testCopy, got)
			mockRepo.AssertExpectations(t)
		})

		t.Run("異常系_存在しないID", func(t *testing.T) {
			mockRepo := new(MockCopyRepository)
			mockRepo.On("Get", ctx, 999).Return(nil, assert.AnError)

			got, err := mockRepo.Get(ctx, 999)

			assert.Error(t, err)
			assert.Nil(t, got)
			mockRepo.AssertExpectations(t)
		})
	})

	t.Run("GetPublished", func(t *testing.T) {
		// テスト用のコピーエンティティリスト
		testCopies := []*entity.Copy{
			{
				ID:              1,
				Title:           "テストタイトル1",
				Description:     "テスト説明1",
				ProductName:     "テスト商品1",
				ProductFeatures: "高品質、使いやすい",
				Target:          "20-30代女性",
				Channel:         entity.ChannelSNS,
				Tone:            entity.ToneCasual,
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
				IsPublished:     true,
			},
		}

		t.Run("正常系", func(t *testing.T) {
			mockRepo := new(MockCopyRepository)
			mockRepo.On("GetPublished", ctx).Return(testCopies, nil)

			got, err := mockRepo.GetPublished(ctx)

			assert.NoError(t, err)
			assert.Equal(t, testCopies, got)
			mockRepo.AssertExpectations(t)
		})

		t.Run("異常系_エラー発生", func(t *testing.T) {
			mockRepo := new(MockCopyRepository)
			mockRepo.On("GetPublished", ctx).Return(nil, assert.AnError)

			got, err := mockRepo.GetPublished(ctx)

			assert.Error(t, err)
			assert.Nil(t, got)
			mockRepo.AssertExpectations(t)
		})
	})

	t.Run("UpdateLikes", func(t *testing.T) {
		t.Run("正常系", func(t *testing.T) {
			mockRepo := new(MockCopyRepository)
			mockRepo.On("UpdateLikes", ctx, 1, 1).Return(nil)

			err := mockRepo.UpdateLikes(ctx, 1, 1)

			assert.NoError(t, err)
			mockRepo.AssertExpectations(t)
		})

		t.Run("異常系_存在しないID", func(t *testing.T) {
			mockRepo := new(MockCopyRepository)
			mockRepo.On("UpdateLikes", ctx, 999, 1).Return(assert.AnError)

			err := mockRepo.UpdateLikes(ctx, 999, 1)

			assert.Error(t, err)
			mockRepo.AssertExpectations(t)
		})
	})
}
