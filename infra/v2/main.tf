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

# ACM証明書（ap-northeast-1で発行）
resource "aws_acm_certificate" "api" {
  domain_name       = var.custom_domain
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  zone_id = aws_route53_zone.main.id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Lambda用IAMロール
resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ECRリポジトリ（Lambda用）
resource "aws_ecr_repository" "lambda" {
  name = "ai-sales-copy-generator-lambda"
}

# Lambda関数（Goバイナリ or Dockerイメージ）
resource "aws_lambda_function" "api" {
  function_name = "api-lambda"
  role          = aws_iam_role.lambda_exec.arn
  
  # Goバイナリzipの場合
  # filename         = var.lambda_zip_path
  # handler          = "main"
  # runtime          = "go1.x"

  # Dockerイメージの場合
  image_uri        = "${aws_ecr_repository.lambda.repository_url}:latest"
  package_type     = "Image"

  memory_size      = 128
  timeout          = 10
  publish          = true

  environment {
    variables = var.lambda_env
  }
}

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "api" {
  name          = "api-http"
  protocol_type = "HTTP"
}

# Lambda統合
resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# ルート（ANY /{proxy+}）
resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# デプロイ
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# LambdaにAPI Gatewayからのinvoke権限を付与
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# API Gatewayカスタムドメイン
resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = var.custom_domain
  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.api.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

# API Gateway API Mapping
resource "aws_apigatewayv2_api_mapping" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.default.id
}

# Route53 ALIASレコード
resource "aws_route53_record" "api_domain" {
  zone_id = aws_route53_zone.main.id
  name    = var.custom_domain
  type    = "A"
  alias {
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53ホストゾーン（ドメイン未取得の場合のみ。既存の場合はこのリソースはapplyしないでください）
resource "aws_route53_zone" "main" {
  name = var.hosted_zone_domain
} 