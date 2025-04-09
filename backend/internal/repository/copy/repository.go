package copy_repository

import (
	"context"

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
	return r.db.WithContext(ctx).Create(copy).Error
}
