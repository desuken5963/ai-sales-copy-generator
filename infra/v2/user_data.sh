#!/bin/bash

# ログファイルの設定
exec > >(tee /var/log/user-data.log)
exec 2>&1

# パッケージの更新
yum update -y

# Amazon Linux Extrasリポジトリの有効化
amazon-linux-extras install -y nginx1 docker

# 必要なパッケージのインストール
yum install -y git

# EPELリポジトリの有効化とcertbotのインストール
amazon-linux-extras install -y epel
yum install -y certbot python2-certbot-nginx

# MySQL公式リポジトリの追加
yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm

# MySQL 8.0を無効化し、MySQL 5.7を有効化
yum-config-manager --disable mysql80-community
yum-config-manager --enable mysql57-community

# MySQLのインストール
yum install -y mysql-community-server mysql-community-client --nogpgcheck

# MySQLサービスの開始
systemctl start mysqld
systemctl enable mysqld

# 一時的なrootパスワードを取得
TEMP_PASSWORD=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')

# MySQLの初期設定
mysql --connect-expired-password -uroot -p"$TEMP_PASSWORD" << MYSQL_EOF
SET GLOBAL validate_password_policy=LOW;
SET GLOBAL validate_password_length=4;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${mysql_password}';
CREATE DATABASE IF NOT EXISTS ${mysql_database};
CREATE USER '${mysql_user}'@'localhost' IDENTIFIED BY '${mysql_password}';
GRANT ALL PRIVILEGES ON ${mysql_database}.* TO '${mysql_user}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_EOF

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

# 環境変数を設定
export PATH=$PATH:/usr/local/go/bin
export GOPATH=/opt/go
export GOCACHE=/tmp/go-cache

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

# systemdサービスファイルの作成
cat > /etc/systemd/system/api.service << 'EOF'
[Unit]
Description=AI Sales Copy Generator API
After=network.target mysqld.service

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
Environment=MYSQL_USER=${mysql_user}
Environment=MYSQL_PASSWORD=${mysql_password}
Environment=MYSQL_DB_HOST=${mysql_host}
Environment=MYSQL_DB_PORT=${mysql_port}
Environment=MYSQL_DATABASE=${mysql_database}

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
mkdir -p /etc/nginx/conf.d
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