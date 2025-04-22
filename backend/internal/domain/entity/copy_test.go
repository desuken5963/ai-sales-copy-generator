package entity

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCopy(t *testing.T) {
	// テスト用の現在時刻
	now := time.Now()

	t.Run("Channel", func(t *testing.T) {
		tests := []struct {
			name    string
			channel Channel
			want    string
		}{
			{
				name:    "SNS",
				channel: ChannelSNS,
				want:    "sns",
			},
			{
				name:    "App",
				channel: ChannelApp,
				want:    "app",
			},
			{
				name:    "Line",
				channel: ChannelLine,
				want:    "line",
			},
			{
				name:    "Pop",
				channel: ChannelPop,
				want:    "pop",
			},
			{
				name:    "Email",
				channel: ChannelEmail,
				want:    "email",
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				assert.Equal(t, tt.want, string(tt.channel))
			})
		}
	})

	t.Run("Tone", func(t *testing.T) {
		tests := []struct {
			name string
			tone Tone
			want string
		}{
			{
				name: "Pop",
				tone: TonePop,
				want: "pop",
			},
			{
				name: "Trust",
				tone: ToneTrust,
				want: "trust",
			},
			{
				name: "Value",
				tone: ToneValue,
				want: "value",
			},
			{
				name: "Luxury",
				tone: ToneLuxury,
				want: "luxury",
			},
			{
				name: "Casual",
				tone: ToneCasual,
				want: "casual",
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				assert.Equal(t, tt.want, string(tt.tone))
			})
		}
	})

	t.Run("Timestamps", func(t *testing.T) {
		copy := &Copy{}

		// タイムスタンプが設定されていないことを確認
		assert.True(t, copy.CreatedAt.IsZero())
		assert.True(t, copy.UpdatedAt.IsZero())

		// タイムスタンプを設定
		copy.CreatedAt = now
		copy.UpdatedAt = now

		// タイムスタンプが正しく設定されたことを確認
		assert.Equal(t, now, copy.CreatedAt)
		assert.Equal(t, now, copy.UpdatedAt)
	})

	t.Run("Likes", func(t *testing.T) {
		copy := &Copy{}

		// いいね数が0で初期化されていることを確認
		assert.Equal(t, 0, copy.Likes)

		// いいね数を増やす
		copy.Likes++

		// いいね数が1に増えたことを確認
		assert.Equal(t, 1, copy.Likes)
	})
}
