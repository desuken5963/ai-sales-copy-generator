# Route 53ホストゾーン
resource "aws_route53_zone" "main" {
  name = var.domain_registration.domain_name
  
  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-zone"
    }
  )
}

# ドメイン登録
/*
resource "aws_route53domains_registered_domain" "main" {
  provider = aws.us-east-1
  domain_name = var.domain_registration.domain_name
  auto_renew  = true

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-domain"
    }
  )
}
*/

# ACM証明書の検証用DNSレコード
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.id
}

# ALBのDNSレコード
resource "aws_route53_record" "alb" {
  zone_id = aws_route53_zone.main.id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# Vercelのドメイン検証用DNSレコード
resource "aws_route53_record" "vercel" {
  zone_id = aws_route53_zone.main.id
  name    = var.domain_registration.domain_name
  type    = "A"
  ttl     = 60
  records = ["76.76.21.21"]
} 