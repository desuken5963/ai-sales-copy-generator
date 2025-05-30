# ベースイメージ
FROM golang:1.21 as base
WORKDIR /api
RUN apt-get update && apt-get install -y default-mysql-client
RUN go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.16.2

# 開発環境
FROM base as development
RUN go install github.com/cosmtrek/air@v1.49.0
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY .air.toml .
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]

# テスト環境
FROM base as test
ARG MAIN_PATH=cmd/test/main.go
WORKDIR /api
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main ${MAIN_PATH}
CMD ["sh", "-c", "migrate -database 'mysql://test_user:test_pass@tcp(test-db:3306)/test_db' -path migrations up && ./main"]

# ビルド環境
FROM base as builder
COPY go.mod go.sum ./
RUN go mod download
COPY . .
ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64
RUN go build -o main ./cmd/api

# 本番環境
FROM debian:bookworm-slim as production
RUN apt-get update && apt-get install -y ca-certificates tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    echo "Asia/Tokyo" > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /api
COPY --from=builder /api/main ./main
COPY --from=builder /api/migrations ./migrations
COPY --from=base /go/bin/migrate /usr/local/bin/migrate
EXPOSE 8080
CMD ["./main"]