package entity

import (
	"time"
)

// Channel: 配信チャネルの種類
type Channel string

const (
	ChannelApp   Channel = "app"
	ChannelLine  Channel = "line"
	ChannelPop   Channel = "pop"
	ChannelSNS   Channel = "sns"
	ChannelEmail Channel = "email"
)

// Tone: トーンの種類
type Tone string

const (
	TonePop    Tone = "pop"
	ToneTrust  Tone = "trust"
	ToneValue  Tone = "value"
	ToneLuxury Tone = "luxury"
	ToneCasual Tone = "casual"
)

// Copy: 販促文エンティティ
type Copy struct {
	ID              int       `json:"id" gorm:"primaryKey;autoIncrement"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Channel         Channel   `json:"channel"`
	Tone            Tone      `json:"tone"`
	Target          string    `json:"target"`
	Likes           int       `json:"likes"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
	IsPublished     bool      `json:"isPublished"`
	ProductName     string    `json:"productName"`
	ProductFeatures string    `json:"productFeatures"`
}
