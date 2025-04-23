# 既存のVercelプロジェクトを参照
data "vercel_project" "main" {
  name = var.frontend_project_name
}

# 環境変数
resource "vercel_project_environment_variable" "api_base_url" {
  project_id = data.vercel_project.main.id
  key        = "NEXT_PUBLIC_API_BASE_URL"
  value      = "https://${var.domain_name}/api/v1"
  target     = ["production", "preview", "development"]

  depends_on = [
    aws_lb.main,
    aws_route53_record.alb
  ]
}

resource "vercel_project_environment_variable" "environment" {
  project_id = data.vercel_project.main.id
  key        = "NEXT_PUBLIC_ENVIRONMENT"
  value      = var.environment
  target     = ["production", "preview", "development"]

  depends_on = [
    aws_lb.main,
    aws_route53_record.alb
  ]
} 