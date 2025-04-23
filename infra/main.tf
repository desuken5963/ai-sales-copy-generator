terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.4"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "ap-northeast-1"
}

provider "vercel" {
  api_token = var.vercel_api_token
}

# タグの共通設定
locals {
  common_tags = {
    Project     = "ai-sales-copy-generator"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
} 