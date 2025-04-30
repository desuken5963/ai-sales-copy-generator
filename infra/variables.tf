variable "environment" {
  description = "環境名（dev/stg/prod）"
  type        = string
}

variable "vercel_api_token" {
  description = "Vercel APIトークン"
  type        = string
  sensitive   = true
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.0.0/20", "10.0.16.0/20"]
}

variable "private_subnet_cidrs" {
  description = "プライベートサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.128.0/20", "10.0.144.0/20"]
}

variable "domain_name" {
  description = "APIのドメイン名"
  type        = string
}

variable "domain_registration" {
  description = "ドメイン情報"
  type = object({
    domain_name = string
  })
}

variable "github_repo" {
  description = "GitHubリポジトリ名（owner/repo形式）"
  type        = string
  default     = "desuken5963/ai-sales-copy-generator"
}

variable "frontend_project_name" {
  description = "Vercelプロジェクト名"
  type        = string
  default     = "ai-sales-copy-generator"
}

variable "db_username" {
  description = "RDSのユーザー名"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "RDSのパスワード"
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_port" {
  description = "RDSのポート番号"
  type        = string
  default     = "3306"
}

variable "db_name" {
  description = "RDSのデータベース名"
  type        = string
  default     = "ai_sales_copy"
}

variable "openai_api_key" {
  description = "OpenAI APIキー"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "backend_project_name" {
  description = "バックエンドプロジェクト名"
  type        = string
  default     = "ai-sales-copy-generator-api"
}

variable "cors_origin" {
  description = "CORSの許可オリジン"
  type        = string
  default     = "https://ai-sales-copy-generator.click"
} 