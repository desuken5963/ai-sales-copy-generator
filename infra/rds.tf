# セキュリティグループ（RDS用）
resource "aws_security_group" "rds" {
  name        = "${var.environment}-rds-sg"
  description = "RDS Security Group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-rds-sg"
    }
  )
}

# DBサブネットグループ
resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-db-subnet-group"
    }
  )
}

# DBパラメータグループ
resource "aws_rds_cluster_parameter_group" "main" {
  name        = "${var.environment}-aurora-mysql-parameter-group"
  family      = "aurora-mysql8.0"
  description = "Custom parameter group for Aurora MySQL 8.0"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "character_set_client"
    value = "utf8mb4"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-aurora-mysql-parameter-group"
    }
  )
}

# Auroraクラスター
resource "aws_rds_cluster" "main" {
  cluster_identifier      = "${var.environment}-aurora-cluster"
  engine                 = "aurora-mysql"
  engine_version         = "8.0.mysql_aurora.3.04.0"
  database_name          = "main"
  master_username        = "admin"
  master_password        = random_password.db_master_password.result
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.main.name
  skip_final_snapshot    = true
  enable_http_endpoint   = false

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-aurora-cluster"
    }
  )
}

# Auroraインスタンス（Writer）
resource "aws_rds_cluster_instance" "writer" {
  cluster_identifier = aws_rds_cluster.main.id
  instance_class    = "db.t3.medium"
  engine            = aws_rds_cluster.main.engine
  engine_version    = aws_rds_cluster.main.engine_version
  identifier        = "${var.environment}-aurora-writer"

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-aurora-writer"
    }
  )
}

# Auroraインスタンス（Reader）
resource "aws_rds_cluster_instance" "reader" {
  cluster_identifier = aws_rds_cluster.main.id
  instance_class    = "db.t3.medium"
  engine            = aws_rds_cluster.main.engine
  engine_version    = aws_rds_cluster.main.engine_version
  identifier        = "${var.environment}-aurora-reader"
  promotion_tier    = 1

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-aurora-reader"
    }
  )
}

# マスターパスワード生成
resource "random_password" "db_master_password" {
  length  = 16
  special = false
} 