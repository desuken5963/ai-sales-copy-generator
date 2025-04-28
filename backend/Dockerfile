# ベースイメージ
FROM golang:1.21 as base
WORKDIR /api
RUN apt-get update && apt-get install -y default-mysql-client

# 開発環境
FROM base as development
RUN go install github.com/cosmtrek/air@v1.49.0
RUN go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.16.2
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY .air.toml .
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]

# テスト環境
FROM base as test
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api
EXPOSE 8080
CMD ["./main"]

# ビルド環境
FROM base as builder
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# 本番環境
FROM alpine:latest as production
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /api/main .
EXPOSE 8080
CMD ["./main"]