package copy_repository

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/repository"
)

type copyRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) repository.CopyRepository {
	return &copyRepository{db: db}
}

func (r *copyRepository) Create(ctx context.Context, copy *entity.Copy) error {
	// デフォルト値の設定
	copy.Likes = 0
	copy.CreatedAt = time.Now()
	copy.UpdatedAt = time.Now()

	return r.db.WithContext(ctx).Create(copy).Error
}
