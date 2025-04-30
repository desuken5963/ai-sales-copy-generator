# Vercelプロジェクトの設定
resource "vercel_project" "main" {
  name      = var.frontend_project_name
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = "main"
  }

  root_directory    = "frontend"
  build_command     = "npm run build"
  output_directory  = ".next"

  # 自動デプロイを無効化
  ignore_command = "if [ $VERCEL_ENV != 'production' ]; then exit 0; else exit 1; fi"
}

# カスタムドメインの設定
resource "vercel_project_domain" "main" {
  project_id = vercel_project.main.id
  domain     = var.domain_registration.domain_name
}

# 既存のデータソースを削除し、新しいリソースを参照するように変更
resource "vercel_project_environment_variable" "api_base_url" {
  project_id = vercel_project.main.id
  key        = "NEXT_PUBLIC_API_BASE_URL"
  value      = "https://${var.domain_name}/api/v1"
  target     = ["production"]

  depends_on = [
    aws_lb.main,
    aws_route53_record.alb
  ]
}

resource "vercel_project_environment_variable" "environment" {
  project_id = vercel_project.main.id
  key        = "NEXT_PUBLIC_ENVIRONMENT"
  value      = var.environment
  target     = ["production"]

  depends_on = [
    aws_lb.main,
    aws_route53_record.alb
  ]
} 