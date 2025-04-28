FROM node:20.11.1-bullseye

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# Playwrightのブラウザと依存をインストール（公式推奨）
RUN npx playwright install --with-deps

# アプリケーションのコピー
COPY . .

# 開発サーバーを起動
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"] 