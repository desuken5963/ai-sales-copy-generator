variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "lambda_env" {
  description = "Lambda関数の環境変数（map型）"
  type        = map(string)
  default     = {}
}

variable "custom_domain" {
  description = "API Gatewayに割り当てる独自ドメイン名（例: api.ai-sales-copy-generator.click）"
  type        = string
}

variable "hosted_zone_domain" {
  description = "Route53ホストゾーンを作成する場合のドメイン名（例: ai-sales-copy-generator.click）"
  type        = string
  default     = ""
} 