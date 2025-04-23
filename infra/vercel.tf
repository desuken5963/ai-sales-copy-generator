# Vercelプロジェクト
resource "vercel_project" "main" {
  name      = var.frontend_project_name
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = var.github_repo
  }
}

# 環境変数
resource "vercel_project_environment_variable" "api_url" {
  project_id = vercel_project.main.id
  key        = "NEXT_PUBLIC_API_URL"
  value      = "https://${var.domain_name}"
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "environment" {
  project_id = vercel_project.main.id
  key        = "NEXT_PUBLIC_ENVIRONMENT"
  value      = var.environment
  target     = ["production", "preview", "development"]
} 