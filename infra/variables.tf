variable "environment" {
  description = "環境名（例：dev, prod）"
  type        = string
  default     = "dev"
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

variable "github_repo" {
  description = "GitHubリポジトリ名（例：username/repo）"
  type        = string
}

variable "frontend_project_name" {
  description = "Vercelプロジェクト名"
  type        = string
  default     = "ai-sales-copy-generator-frontend"
} 