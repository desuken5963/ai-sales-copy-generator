# ECSクラスター
resource "aws_ecs_cluster" "main" {
  name = "ai-sales-copy-generator"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "ai-sales-copy-generator"
    }
  )
}

# セキュリティグループ（ECSタスク用）
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.backend_project_name}-ecs-tasks-sg"
  description = "ECS Tasks Security Group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
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
      Name = "${var.backend_project_name}-ecs-tasks-sg"
    }
  )
}

# ECRリポジトリ
resource "aws_ecr_repository" "main" {
  name = var.backend_project_name
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.backend_project_name}-ecr"
    }
  )
}

# タスク定義
resource "aws_ecs_task_definition" "main" {
  family                   = var.backend_project_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "${aws_ecr_repository.main.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "DATABASE_URL"
          value = "mysql://${var.db_username}:${var.db_password}@${aws_rds_cluster.main.endpoint}:${var.db_port}/${var.db_name}"
        },
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "PORT"
          value = "8080"
        },
        {
          name  = "DB_USER"
          value = var.db_username
        },
        {
          name  = "DB_PASSWORD"
          value = var.db_password
        },
        {
          name  = "DB_HOST"
          value = aws_rds_cluster.main.endpoint
        },
        {
          name  = "DB_PORT"
          value = var.db_port
        },
        {
          name  = "DB_NAME"
          value = var.db_name
        },
        {
          name  = "OPENAI_API_KEY"
          value = var.openai_api_key
        },
        {
          name  = "CORS_ORIGIN"
          value = "https://${var.domain_name}"
        }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.main.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
          awslogs-timezone      = "Asia/Tokyo"
        }
      }
    }
  ])

  tags = merge(
    local.common_tags,
    {
      Name = "${var.backend_project_name}-task-definition"
    }
  )
}

# ECSサービス
resource "aws_ecs_service" "main" {
  name            = "ai-sales-copy-generator-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  deployment_controller {
    type = "ECS"
  }

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "api"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener.https,
    aws_iam_role_policy_attachment.ecs_task_execution_role_policy,
    aws_rds_cluster_instance.writer,
    aws_rds_cluster_instance.reader
  ]

  tags = merge(
    local.common_tags,
    {
      Name = "ai-sales-copy-generator-api"
    }
  )
}

# CloudWatch Logsグループ
resource "aws_cloudwatch_log_group" "main" {
  name              = "/ecs/${var.backend_project_name}"
  retention_in_days = 30

  tags = merge(
    local.common_tags,
    {
      Name = "${var.backend_project_name}-logs"
    }
  )
}

# SSMパラメータストアにCloudWatch Agent設定を保存
resource "aws_ssm_parameter" "cloudwatch_agent_config" {
  name  = "/${var.environment}/cloudwatch-agent/config"
  type  = "String"
  value = jsonencode({
    logs = {
      timezone = "Local"
      metrics_collected = {
        emf = {
          timezone = "Asia/Tokyo"
        }
      }
    }
  })
}

# ECSタスク実行ロールにSSMパラメータ読み取り権限を追加
resource "aws_iam_role_policy" "ecs_task_execution_ssm" {
  name = "${var.backend_project_name}-ecs-task-execution-ssm"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = aws_ssm_parameter.cloudwatch_agent_config.arn
      }
    ]
  })
}

# CloudWatch Logsのタイムゾーン設定
resource "aws_cloudwatch_query_definition" "timezone" {
  name = "${var.backend_project_name}-timezone"
  log_group_names = [aws_cloudwatch_log_group.main.name]

  query_string = <<EOF
fields @timestamp
| filter @type = "timezone"
| display @timestamp, @message
| sort @timestamp desc
EOF
}

# ECSタスク定義のログ設定を更新
resource "aws_cloudwatch_log_metric_filter" "timezone" {
  name           = "${var.backend_project_name}-timezone"
  pattern        = ""
  log_group_name = aws_cloudwatch_log_group.main.name

  metric_transformation {
    name          = "TimezoneFilter"
    namespace     = "ECS/${var.backend_project_name}"
    value         = "1"
    default_value = "0"
  }
}

# IAMロール（タスク実行用）
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.backend_project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(
    local.common_tags,
    {
      Name = "${var.backend_project_name}-ecs-task-execution-role"
    }
  )
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAMロール（タスク用）
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.backend_project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(
    local.common_tags,
    {
      Name = "${var.backend_project_name}-ecs-task-role"
    }
  )
} 