package e2e

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenerateSalesCopy(t *testing.T) {
	// テストサーバーを起動
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// リクエストボディを解析
		var reqBody struct {
			ProductFeatures string `json:"product_features"`
		}
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			t.Fatal(err)
		}

		// レスポンスを返す
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"sales_copy": "これはテスト用のセールスコピーです。",
		})
	}))
	defer server.Close()

	// テストケース
	tests := []struct {
		name            string
		productFeatures string
		expectedStatus  int
	}{
		{
			name:            "正常なリクエスト",
			productFeatures: "高性能なノートパソコン",
			expectedStatus:  http.StatusOK,
		},
		{
			name:            "空のリクエスト",
			productFeatures: "",
			expectedStatus:  http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// リクエストボディを作成
			reqBody, _ := json.Marshal(map[string]string{
				"product_features": tt.productFeatures,
			})

			// リクエストを作成
			req, err := http.NewRequest("POST", server.URL+"/api/generate", bytes.NewBuffer(reqBody))
			if err != nil {
				t.Fatal(err)
			}
			req.Header.Set("Content-Type", "application/json")

			// リクエストを送信
			client := &http.Client{}
			resp, err := client.Do(req)
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()

			// ステータスコードを確認
			assert.Equal(t, tt.expectedStatus, resp.StatusCode)

			if tt.expectedStatus == http.StatusOK {
				// レスポンスボディを解析
				var respBody struct {
					SalesCopy string `json:"sales_copy"`
				}
				if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
					t.Fatal(err)
				}

				// レスポンスの内容を確認
				assert.NotEmpty(t, respBody.SalesCopy)
			}
		})
	}
}
