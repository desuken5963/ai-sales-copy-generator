FROM node:23.6.1-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# Playwrightのブラウザをインストール
RUN npx playwright install --with-deps chromium

# アプリケーションのコピー
COPY . .

# 開発サーバーを起動
EXPOSE 3000

# テストの実行
CMD ["npm", "test", "--", "--watchAll=false"] 