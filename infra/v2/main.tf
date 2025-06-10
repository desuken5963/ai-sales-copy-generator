terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}

# タグの共通設定
locals {
  common_tags = {
    Project     = "ai-sales-copy-generator"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-vpc"
    }
  )
}

# パブリックサブネット
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-public-subnet"
    }
  )
}

# インターネットゲートウェイ
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-igw"
    }
  )
}

# パブリックルートテーブル
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-public-rt"
    }
  )
}

# パブリックサブネットとルートテーブルの関連付け
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# セキュリティグループ
resource "aws_security_group" "api_server" {
  name        = "${var.environment}-api-server-sg"
  description = "Security group for API server"
  vpc_id      = aws_vpc.main.id

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
}

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
}

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # 本番環境では特定のIPに制限することを推奨
  }

  # API server port
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-api-server-sg"
    }
  )
}

# Elastic IP
resource "aws_eip" "api_server" {
  domain   = "vpc"
  instance = aws_instance.api_server.id

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-api-server-eip"
    }
  )
}

# EC2インスタンス
resource "aws_instance" "api_server" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name              = var.key_name
  vpc_security_group_ids = [aws_security_group.api_server.id]
  subnet_id             = aws_subnet.public.id

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    github_repo     = var.github_repo
    openai_api_key  = var.openai_api_key
    cors_origin     = var.cors_origin
    domain_name     = var.domain_name
    mysql_user      = var.mysql_user
    mysql_password  = var.mysql_password
    mysql_database  = var.mysql_database
    mysql_port      = var.mysql_port
    mysql_host      = var.mysql_host
  }))

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-api-server"
    }
  )
}

# Route53ホストゾーン
resource "aws_route53_zone" "main" {
  name = var.hosted_zone_domain

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-zone"
    }
  )
}

# Route53レコード
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [aws_eip.api_server.public_ip]
}

# フロントエンド用のRoute53レコード（Vercel指定のAレコード）
resource "aws_route53_record" "frontend" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.hosted_zone_domain  # ai-sales-copy-generator.click
  type    = "A"
  ttl     = 300
  records = ["216.198.79.193"]  # Vercelから指定されたIPアドレス
}

# www用のRoute53レコード（Vercel指定のCNAMEレコード）
resource "aws_route53_record" "frontend_www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.hosted_zone_domain}"  # www.ai-sales-copy-generator.click
  type    = "CNAME"
  ttl     = 300
  records = ["de07fcbd3e8b888e.vercel-dns-017.com"]  # Vercelから指定されたCNAME
}

# データソース
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

 