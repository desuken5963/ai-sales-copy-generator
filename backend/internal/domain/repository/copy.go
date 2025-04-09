package repository

import (
	"context"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
)

type CopyRepository interface {
	Create(ctx context.Context, copy *entity.Copy) error
}
