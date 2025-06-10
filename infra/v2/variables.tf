variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "環境名（dev/stg/prod）"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "パブリックサブネットのCIDRブロック"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2インスタンスタイプ"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "EC2インスタンス用のキーペア名"
  type        = string
}

variable "domain_name" {
  description = "APIのドメイン名"
  type        = string
  default     = "api.ai-sales-copy-generator.click"
}

variable "hosted_zone_domain" {
  description = "Route53ホストゾーンのドメイン名"
  type        = string
  default     = "ai-sales-copy-generator.click"
}

variable "github_repo" {
  description = "GitHubリポジトリ名（owner/repo形式）"
  type        = string
  default     = "desuken5963/ai-sales-copy-generator"
}

variable "openai_api_key" {
  description = "OpenAI APIキー"
  type        = string
  sensitive   = true
}

variable "cors_origin" {
  description = "CORSの許可オリジン"
  type        = string
  default     = "https://ai-sales-copy-generator.click"
}

# MySQL関連の変数
variable "mysql_user" {
  description = "MySQLユーザー名"
  type        = string
  default     = "admin"
}

variable "mysql_password" {
  description = "MySQLパスワード"
  type        = string
  sensitive   = true
}

variable "mysql_database" {
  description = "MySQLデータベース名"
  type        = string
  default     = "ai_sales_copy_generator"
}

variable "mysql_port" {
  description = "MySQLポート番号"
  type        = string
  default     = "3306"
}

variable "mysql_host" {
  description = "MySQLホスト名"
  type        = string
  default     = "localhost"
} 

 