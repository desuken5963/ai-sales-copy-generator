# AI Sales Copy Generator - EC2構成 (v2)

月額2000円以内の最小構成でAPIサーバーを構築します。

## 構成

- **EC2インスタンス**: t3.micro（API + SQLite DB）
- **VPC**: プライベート/パブリックサブネット分離
- **Elastic IP**: 固定IP割り当て
- **Route53**: DNSレコード設定
- **Nginx**: リバースプロキシ + SSL終端
- **Let's Encrypt**: 無料SSL証明書

## 月額コスト試算

- EC2 t3.micro: ~$8.5/月（~1,200円）
- Elastic IP: ~$3.6/月（~500円）
- EBS gp3 20GB: ~$2/月（~300円）

**合計**: 約$14.1/月（約2,000円/月）

## デプロイ手順

### 1. 前提条件

- AWSアカウントとCLI設定
- Route53でのドメイン取得済み（ai-sales-copy-generator.click）
- EC2キーペア作成済み

### 2. キーペア作成（未作成の場合）

```bash
aws ec2 create-key-pair --key-name ai-sales-copy-api-key --query 'KeyMaterial' --output text > ~/.ssh/ai-sales-copy-api-key.pem
chmod 400 ~/.ssh/ai-sales-copy-api-key.pem
```

### 3. terraform.tfvarsの設定

```bash
# terraform.tfvarsのkey_nameを実際のキーペア名に変更
key_name = "ai-sales-copy-api-key"  # 作成したキーペア名
```

### 4. Terraformデプロイ

```bash
cd infra/v2

# 初期化
terraform init

# プランの確認
terraform plan

# デプロイ実行
terraform apply
```

### 5. SSL証明書の設定

デプロイ完了後、EC2インスタンスにSSHでアクセスしてSSL証明書を設定：

```bash
# EC2インスタンスにSSH接続
ssh -i ~/.ssh/ai-sales-copy-api-key.pem ec2-user@<PUBLIC_IP>

# Let's Encrypt証明書の取得
sudo certbot --nginx -d api.ai-sales-copy-generator.click --non-interactive --agree-tos --email your-email@example.com

# 証明書の自動更新設定
sudo crontab -e
# 以下を追加:
# 0 3 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

### 6. 動作確認

```bash
# API動作確認
curl https://api.ai-sales-copy-generator.click/health

# サービス状態確認
ssh -i ~/.ssh/ai-sales-copy-api-key.pem ec2-user@<PUBLIC_IP>
sudo systemctl status api
sudo systemctl status nginx
```

## トラブルシューティング

### ログ確認

```bash
# アプリケーションログ
sudo journalctl -u api -f

# User dataログ
sudo tail -f /var/log/user-data.log

# Nginxログ
sudo tail -f /var/log/nginx/error.log
```

### 手動でのアプリケーション再起動

```bash
sudo systemctl restart api
sudo systemctl restart nginx
```

## セキュリティ考慮事項

1. **SSH接続制限**: 本番環境では特定のIPからのみSSHアクセスを許可することを推奨
2. **定期的なセキュリティアップデート**: 
   ```bash
   sudo yum update -y
   ```
3. **バックアップ**: SQLiteデータベースの定期バックアップを設定

## 削除手順

```bash
terraform destroy
```

**注意**: Elastic IPは削除されますが、Route53レコードは手動で確認してください。 