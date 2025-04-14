package routes

import (
	"github.com/gin-gonic/gin"

	copy_handler "github.com/takanoakira/ai-sales-copy-generator/backend/internal/handler/copy"
)

func SetupCopyRoutes(r *gin.Engine, handler copy_handler.Handler) {
	v1 := r.Group("/api/v1")
	{
		v1.POST("/copies", handler.CreateCopy)
		v1.GET("/copies/:id", handler.GetCopy)
	}
}
