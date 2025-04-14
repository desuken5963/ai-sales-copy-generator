package copy_handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/entity"
	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/domain/repository"
	copy_usecase "github.com/takanoakira/ai-sales-copy-generator/backend/internal/usecase/copy"
)

type Handler interface {
	CreateCopy(c *gin.Context)
	GetCopy(c *gin.Context)
}

type handler struct {
	usecase copy_usecase.UseCase
}

type CreateCopyRequest struct {
	ProductName     string         `json:"productName" binding:"required"`
	ProductFeatures string         `json:"productFeatures" binding:"required"`
	Target          string         `json:"target" binding:"required"`
	Channel         entity.Channel `json:"channel" binding:"required"`
	Tone            entity.Tone    `json:"tone" binding:"required"`
	IsPublished     bool           `json:"isPublished"`
}

func NewHandler(repo repository.CopyRepository) Handler {
	return &handler{
		usecase: copy_usecase.NewUseCase(repo),
	}
}

func (h *handler) CreateCopy(c *gin.Context) {
	var req CreateCopyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := copy_usecase.CreateCopyInput{
		ProductName:     req.ProductName,
		ProductFeatures: req.ProductFeatures,
		Target:          req.Target,
		Channel:         req.Channel,
		Tone:            req.Tone,
		IsPublished:     req.IsPublished,
	}

	copy, err := h.usecase.CreateCopy(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, copy)
}

func (h *handler) GetCopy(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id parameter"})
		return
	}

	copy, err := h.usecase.GetCopy(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, copy)
}
