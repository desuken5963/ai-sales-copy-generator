output "api_endpoint" {
  description = "API GatewayのエンドポイントURL"
  value       = aws_apigatewayv2_api.api.api_endpoint
} 