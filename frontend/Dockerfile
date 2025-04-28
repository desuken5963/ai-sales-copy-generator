FROM node:23.6.1-alpine

WORKDIR /app

# Playwrightの依存関係をインストール
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# SWCとJestの依存関係をインストール
RUN npm install -D @swc/core @swc/jest

# Playwrightのブラウザをインストール
ENV PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers
RUN npx playwright install chromium

# アプリケーションのコピー
COPY . .

# 開発サーバーを起動
EXPOSE 3000

# テストの実行
CMD ["npm", "test", "--", "--watchAll=false"] 