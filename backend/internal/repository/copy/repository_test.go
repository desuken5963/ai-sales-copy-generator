package copy_repository

import (
	"context"
	"errors"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
)

func setupTestDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock, error) {
	// SQLMockの作成
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		return nil, nil, err
	}

	// GORMでSQLMockを使用するための設定
	dialector := mysql.New(mysql.Config{
		Conn:                      sqlDB,
		SkipInitializeWithVersion: true,
	})

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, nil, err
	}

	return db, mock, nil
}

func TestCreate(t *testing.T) {
	// テストデータの準備
	now := time.Now()
	testCopy := &entity.Copy{
		Title:           "テストタイトル",
		Description:     "テスト説明",
		ProductName:     "テスト商品",
		ProductFeatures: "高品質、使いやすい",
		Target:          "20-30代女性",
		Channel:         entity.ChannelSNS,
		Tone:            entity.ToneCasual,
		IsPublished:     true,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	tests := []struct {
		name    string
		copy    *entity.Copy
		wantErr bool
	}{
		{
			name:    "正常系",
			copy:    testCopy,
			wantErr: false,
		},
		{
			name:    "異常系_DBエラー",
			copy:    testCopy,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// テスト用DBのセットアップ
			db, mock, err := setupTestDB(t)
			assert.NoError(t, err)

			// SQLクエリのモック
			if tt.wantErr {
				mock.ExpectBegin()
				mock.ExpectExec(regexp.QuoteMeta("INSERT INTO `copies`")).
					WillReturnError(errors.New("database error"))
				mock.ExpectRollback()
			} else {
				mock.ExpectBegin()
				mock.ExpectExec(regexp.QuoteMeta("INSERT INTO `copies`")).
					WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()
			}

			// リポジトリの作成
			repo := NewRepository(db)

			// テスト実行
			err = repo.Create(context.Background(), tt.copy)

			// アサーション
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			// すべてのモックが呼び出されたことを確認
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestGet(t *testing.T) {
	// テストデータの準備
	now := time.Now()
	testCopy := &entity.Copy{
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
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	tests := []struct {
		name    string
		id      int
		want    *entity.Copy
		wantErr bool
	}{
		{
			name:    "正常系",
			id:      1,
			want:    testCopy,
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
			// テスト用DBのセットアップ
			db, mock, err := setupTestDB(t)
			assert.NoError(t, err)

			// SQLクエリのモック
			if tt.wantErr {
				mock.ExpectQuery(regexp.QuoteMeta("SELECT * FROM `copies` WHERE `copies`.`id` = ? ORDER BY `copies`.`id` LIMIT 1")).
					WithArgs(tt.id).
					WillReturnError(gorm.ErrRecordNotFound)
			} else {
				rows := sqlmock.NewRows([]string{
					"id", "title", "description", "product_name", "product_features",
					"target", "channel", "tone", "likes", "is_published",
					"created_at", "updated_at",
				}).AddRow(
					testCopy.ID, testCopy.Title, testCopy.Description,
					testCopy.ProductName, testCopy.ProductFeatures,
					testCopy.Target, testCopy.Channel, testCopy.Tone,
					testCopy.Likes, testCopy.IsPublished,
					testCopy.CreatedAt, testCopy.UpdatedAt,
				)

				mock.ExpectQuery(regexp.QuoteMeta("SELECT * FROM `copies` WHERE `copies`.`id` = ? ORDER BY `copies`.`id` LIMIT 1")).
					WithArgs(tt.id).
					WillReturnRows(rows)
			}

			// リポジトリの作成
			repo := NewRepository(db)

			// テスト実行
			got, err := repo.Get(context.Background(), tt.id)

			// アサーション
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}

			// すべてのモックが呼び出されたことを確認
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestGetPublished(t *testing.T) {
	// テストデータの準備
	now := time.Now()
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
			Likes:           0,
			IsPublished:     true,
			CreatedAt:       now,
			UpdatedAt:       now,
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
			CreatedAt:       now,
			UpdatedAt:       now,
		},
	}

	tests := []struct {
		name    string
		want    []*entity.Copy
		wantErr bool
	}{
		{
			name:    "正常系",
			want:    testCopies,
			wantErr: false,
		},
		{
			name:    "異常系_DBエラー",
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// テスト用DBのセットアップ
			db, mock, err := setupTestDB(t)
			assert.NoError(t, err)

			// SQLクエリのモック
			if tt.wantErr {
				mock.ExpectQuery(regexp.QuoteMeta("SELECT * FROM `copies` WHERE is_published = ?")).
					WithArgs(true).
					WillReturnError(errors.New("database error"))
			} else {
				rows := sqlmock.NewRows([]string{
					"id", "title", "description", "product_name", "product_features",
					"target", "channel", "tone", "likes", "is_published",
					"created_at", "updated_at",
				})

				for _, copy := range testCopies {
					rows.AddRow(
						copy.ID, copy.Title, copy.Description,
						copy.ProductName, copy.ProductFeatures,
						copy.Target, copy.Channel, copy.Tone,
						copy.Likes, copy.IsPublished,
						copy.CreatedAt, copy.UpdatedAt,
					)
				}

				mock.ExpectQuery(regexp.QuoteMeta("SELECT * FROM `copies` WHERE is_published = ?")).
					WithArgs(true).
					WillReturnRows(rows)
			}

			// リポジトリの作成
			repo := NewRepository(db)

			// テスト実行
			got, err := repo.GetPublished(context.Background())

			// アサーション
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}

			// すべてのモックが呼び出されたことを確認
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestUpdateLikes(t *testing.T) {
	tests := []struct {
		name    string
		id      int
		likes   int
		wantErr bool
	}{
		{
			name:    "正常系",
			id:      1,
			likes:   1,
			wantErr: false,
		},
		{
			name:    "異常系_存在しないID",
			id:      999,
			likes:   1,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// テスト用DBのセットアップ
			db, mock, err := setupTestDB(t)
			assert.NoError(t, err)

			// SQLクエリのモック
			if tt.wantErr {
				mock.ExpectBegin()
				mock.ExpectExec("UPDATE `copies` SET").
					WithArgs(tt.likes, sqlmock.AnyArg(), tt.id).
					WillReturnError(errors.New("database error"))
				mock.ExpectRollback()
			} else {
				mock.ExpectBegin()
				mock.ExpectExec("UPDATE `copies` SET").
					WithArgs(tt.likes, sqlmock.AnyArg(), tt.id).
					WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()
			}

			// リポジトリの作成
			repo := NewRepository(db)

			// テスト実行
			err = repo.UpdateLikes(context.Background(), tt.id, tt.likes)

			// アサーション
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			// すべてのモックが呼び出されたことを確認
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}
