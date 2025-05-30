package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	copy_handler "github.com/takanoakira/ai-sales-copy-generator/backend/internal/handler/copy"
	copy_repository "github.com/takanoakira/ai-sales-copy-generator/backend/internal/repository/copy"
	"github.com/takanoakira/ai-sales-copy-generator/backend/internal/routes"
)

func main() {
	// 環境変数の読み込み
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// データベース接続
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("TEST_MYSQL_USER"),
		os.Getenv("TEST_MYSQL_PASSWORD"),
		os.Getenv("TEST_MYSQL_HOST"),
		os.Getenv("TEST_MYSQL_PORT"),
		os.Getenv("TEST_MYSQL_DATABASE"),
	)

	// 環境変数が設定されていない場合はデフォルト値を使用
	if dsn == "@tcp(:)/?charset=utf8mb4&parseTime=True&loc=Local" {
		dsn = "test_user:test_pass@tcp(test-db:3306)/test_db?charset=utf8mb4&parseTime=True&loc=Local"
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// リポジトリの初期化
	copyRepository := copy_repository.NewRepository(db)

	// ハンドラーの初期化
	copyHandler := copy_handler.NewHandler(copyRepository)

	// Ginルーターの初期化
	r := gin.Default()

	// CORS設定
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// ルートの設定
	routes.SetupCopyRoutes(r, copyHandler)

	// サーバー起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server started at :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
