package integration

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
	copy_repository "github.com/takanoakira/ai-sales-copy-generator/backend/internal/repository/copy"
	copy_usecase "github.com/takanoakira/ai-sales-copy-generator/backend/internal/usecase/copy"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(&entity.Copy{})
	require.NoError(t, err)

	return db
}

func TestCopyIntegration(t *testing.T) {
	// テスト用のデータベースをセットアップ
	db := setupTestDB(t)
	repo := copy_repository.NewRepository(db)
	usecase := copy_usecase.NewUseCase(repo)

	// OpenAI APIキーを設定
	os.Setenv("OPENAI_API_KEY", "test-key")

	t.Run("コピーの作成と取得", func(t *testing.T) {
		ctx := context.Background()

		// テストデータの作成
		input := copy_usecase.CreateCopyInput{
			ProductName:     "テスト商品",
			ProductFeatures: "高性能、使いやすい",
			Target:          "20代女性",
			Channel:         entity.ChannelApp,
			Tone:            entity.TonePop,
			IsPublished:     true,
		}

		// コピーの作成
		copy, err := usecase.CreateCopy(ctx, input)
		require.NoError(t, err)
		assert.NotEmpty(t, copy.ID)
		assert.Equal(t, input.ProductName, copy.ProductName)
		assert.Equal(t, input.ProductFeatures, copy.ProductFeatures)
		assert.Equal(t, input.Target, copy.Target)
		assert.Equal(t, input.Channel, copy.Channel)
		assert.Equal(t, input.Tone, copy.Tone)
		assert.Equal(t, input.IsPublished, copy.IsPublished)
		assert.Equal(t, 0, copy.Likes)

		// 作成したコピーの取得
		retrievedCopy, err := usecase.GetCopy(ctx, copy.ID)
		require.NoError(t, err)
		assert.Equal(t, copy.ID, retrievedCopy.ID)
		assert.Equal(t, copy.Title, retrievedCopy.Title)
		assert.Equal(t, copy.Description, retrievedCopy.Description)
	})

	t.Run("公開済みコピーの取得", func(t *testing.T) {
		ctx := context.Background()

		// 公開済みコピーの作成
		input := copy_usecase.CreateCopyInput{
			ProductName:     "公開商品",
			ProductFeatures: "高品質",
			Target:          "30代男性",
			Channel:         entity.ChannelEmail,
			Tone:            entity.ToneTrust,
			IsPublished:     true,
		}

		_, err := usecase.CreateCopy(ctx, input)
		require.NoError(t, err)

		// 公開済みコピーの取得
		copies, err := usecase.GetPublishedCopies(ctx)
		require.NoError(t, err)
		assert.Greater(t, len(copies), 0)
		for _, copy := range copies {
			assert.True(t, copy.IsPublished)
		}
	})

	t.Run("いいねの更新", func(t *testing.T) {
		ctx := context.Background()

		// テスト用コピーの作成
		input := copy_usecase.CreateCopyInput{
			ProductName:     "いいねテスト商品",
			ProductFeatures: "人気商品",
			Target:          "全世代",
			Channel:         entity.ChannelSNS,
			Tone:            entity.ToneCasual,
			IsPublished:     true,
		}

		copy, err := usecase.CreateCopy(ctx, input)
		require.NoError(t, err)

		// いいねの更新
		updatedCopy, err := usecase.UpdateLikes(ctx, copy.ID)
		require.NoError(t, err)
		assert.Equal(t, 1, updatedCopy.Likes)

		// 再度いいねを更新
		updatedCopy, err = usecase.UpdateLikes(ctx, copy.ID)
		require.NoError(t, err)
		assert.Equal(t, 2, updatedCopy.Likes)
	})
}
