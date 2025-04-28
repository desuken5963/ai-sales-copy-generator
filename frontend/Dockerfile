FROM node:20.11.1-bullseye

WORKDIR /app

# Playwrightの依存関係をインストール
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    libharfbuzz0b \
    ca-certificates \
    fonts-freefont-ttf \
    nodejs \
    bash \
    xvfb \
    dbus \
    libstdc++6 \
    libgcc1 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    libasound2 \
    libatk1.0-0 \
    libcups2 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# Playwrightのブラウザをインストール
ENV PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers
RUN npx playwright install --with-deps chromium firefox webkit

# アプリケーションのコピー
COPY . .

# 開発サーバーを起動
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"] 