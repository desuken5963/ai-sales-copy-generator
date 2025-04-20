package repository

import (
	"context"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
)

type CopyRepository interface {
	Create(ctx context.Context, copy *entity.Copy) error
	Get(ctx context.Context, id int) (*entity.Copy, error)
	GetPublished(ctx context.Context) ([]*entity.Copy, error)
	UpdateLikes(ctx context.Context, id int, likes int) error
}
