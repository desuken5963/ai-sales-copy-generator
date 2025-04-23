output "alb_dns_name" {
  description = "ALBのDNS名"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "RDSクラスターのエンドポイント"
  value       = aws_rds_cluster.main.endpoint
}

output "rds_reader_endpoint" {
  description = "RDSクラスターのリーダーエンドポイント"
  value       = aws_rds_cluster.main.reader_endpoint
}

output "ecr_repository_url" {
  description = "ECRリポジトリのURL"
  value       = aws_ecr_repository.main.repository_url
}

output "vercel_project_url" {
  description = "VercelプロジェクトのURL"
  value       = "https://${vercel_project.main.name}.vercel.app"
} 