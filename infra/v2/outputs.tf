

output "api_server_public_ip" {
  description = "APIサーバーのパブリックIP"
  value       = aws_eip.api_server.public_ip
}

output "api_server_domain" {
  description = "APIサーバーのドメイン名"
  value       = var.domain_name
}

output "api_server_instance_id" {
  description = "APIサーバーのインスタンスID"
  value       = aws_instance.api_server.id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "route53_zone_id" {
  description = "Route53ホストゾーンID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Route53ネームサーバー（ドメインレジストラで設定が必要）"
  value       = aws_route53_zone.main.name_servers
} 