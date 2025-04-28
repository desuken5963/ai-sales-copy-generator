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
    nodejs \
    bash \
    xvfb \
    dbus \
    libstdc++ \
    libgcc \
    libx11 \
    libxcomposite \
    libxdamage \
    libxext \
    libxfixes \
    libxrandr \
    libxrender \
    libxtst \
    alsa-lib \
    atk-dev \
    cups-libs \
    gtk+3.0 \
    pango \
    gdk-pixbuf \
    cairo

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