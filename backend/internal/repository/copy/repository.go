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

func (r *copyRepository) Get(ctx context.Context, id int) (*entity.Copy, error) {
	var copy entity.Copy
	if err := r.db.WithContext(ctx).First(&copy, id).Error; err != nil {
		return nil, err
	}
	return &copy, nil
}

// GetPublished: 公開済みのコピーのみを取得
func (r *copyRepository) GetPublished(ctx context.Context) ([]*entity.Copy, error) {
	var copies []*entity.Copy
	if err := r.db.WithContext(ctx).Where("is_published = ?", true).Find(&copies).Error; err != nil {
		return nil, err
	}
	return copies, nil
}

func (r *copyRepository) UpdateLikes(ctx context.Context, id int, likes int) error {
	return r.db.WithContext(ctx).Model(&entity.Copy{}).Where("id = ?", id).Update("likes", likes).Error
}
