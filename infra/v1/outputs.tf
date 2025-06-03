# ALBのDNS名
output "alb_dns_name" {
  description = "ALBのDNS名"
  value       = aws_lb.main.dns_name
}

# RDSエンドポイント
output "rds_endpoint" {
  description = "RDSクラスターのエンドポイント"
  value       = aws_rds_cluster.main.endpoint
}

output "rds_reader_endpoint" {
  description = "RDSクラスターのリーダーエンドポイント"
  value       = aws_rds_cluster.main.reader_endpoint
}

# ECRリポジトリURL
output "ecr_repository_url" {
  description = "ECRリポジトリのURL"
  value       = aws_ecr_repository.main.repository_url
}

# Vercel Project URL
output "vercel_project_url" {
  description = "The URL of the Vercel project"
  value       = "https://${var.frontend_project_name}.vercel.app"
} 