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
RUN npm install

# Playwrightのブラウザをインストール
ENV PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers
RUN npx playwright install chromium

# アプリケーションのコピー
COPY . .

# 開発サーバーを起動
EXPOSE 3000

# ユニットテストとE2Eテストを実行
CMD ["sh", "-c", "npm run test:unit && npm run test:e2e"] 