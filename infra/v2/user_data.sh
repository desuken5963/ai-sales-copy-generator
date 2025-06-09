#!/bin/bash

# ログファイルの設定
exec > >(tee /var/log/user-data.log)
exec 2>&1

# パッケージの更新
yum update -y

# 必要なパッケージのインストール
yum install -y git docker nginx certbot python3-certbot-nginx

# Dockerの起動と自動起動設定
systemctl start docker
systemctl enable docker

# ec2-userをdockerグループに追加
usermod -a -G docker ec2-user

# Goのインストール
cd /tmp
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
echo 'export PATH=$PATH:/usr/local/go/bin' >> /home/ec2-user/.bashrc

#環境変数を設定
export PATH=$PATH:/usr/local/go/bin

# アプリケーションディレクトリの作成
mkdir -p /opt/api
cd /opt/api

# GitHubからソースコードをクローン
git clone https://github.com/${github_repo}.git .
cd backend

# Go依存関係のダウンロード
/usr/local/go/bin/go mod download

# アプリケーションのビルド
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 /usr/local/go/bin/go build -o main ./cmd/api

# SQLiteデータベースディレクトリの作成
mkdir -p /opt/api/data

# systemdサービスファイルの作成
cat > /etc/systemd/system/api.service << 'EOF'
[Unit]
Description=AI Sales Copy Generator API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/api/backend
ExecStart=/opt/api/backend/main
Restart=always
RestartSec=3
Environment=PORT=8080
Environment=OPENAI_API_KEY=${openai_api_key}
Environment=CORS_ORIGIN=${cors_origin}
Environment=DB_TYPE=sqlite
Environment=DB_PATH=/opt/api/data/app.db

[Install]
WantedBy=multi-user.target
EOF

# アプリケーションファイルの所有者を変更
chown -R ec2-user:ec2-user /opt/api

# サービスの有効化と開始
systemctl daemon-reload
systemctl enable api
systemctl start api

# Nginxの設定
cat > /etc/nginx/conf.d/api.conf << 'EOF'
server {
    listen 80;
    server_name ${domain_name};

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Nginxの起動と自動起動設定
systemctl start nginx
systemctl enable nginx

# SSL証明書の取得（Let's Encrypt）
# 初回は手動で実行する必要があります
# certbot --nginx -d ${domain_name} --non-interactive --agree-tos --email admin@${domain_name} || true

echo "User data script completed successfully" >> /var/log/user-data.log 