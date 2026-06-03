# BluelearnerHub - Production Deployment Guide

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd Bluelearnerhub

# 2. Install dependencies
npm ci

# 3. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with production values

# 4. Deploy to Kubernetes
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/configmap.yml
# Create secrets manually or with sealed-secrets
kubectl apply -f k8s/secret.yml
kubectl apply -f k8s/pvc.yml
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/frontend-deployment.yml
kubectl apply -f k8s/ai-services-deployment.yml
kubectl apply -f k8s/ingress.yml
kubectl apply -f k8s/hpa.yml

# 5. Setup monitoring
kubectl apply -f k8s/monitoring/
```

---

## 📋 Pre-Deployment Checklist

### Required Secrets
All secrets must be 32+ characters, cryptographically random:

| Secret | Length | Command to generate |
|--------|--------|---------------------|
| JWT_SECRET | 64+ | `openssl rand -base64 64` |
| JWT_REFRESH_SECRET | 64+ | `openssl rand -base64 64` |
| SESSION_SECRET | 64+ | `openssl rand -base64 64` |
| COOKIE_SECRET | 64+ | `openssl rand -base64 64` |
| REDIS_PASSWORD | 32+ | `openssl rand -base64 32` |

### External Services Setup
- [ ] MongoDB Atlas cluster (M10 minimum for production)
- [ ] Redis Cloud or AWS ElastiCache
- [ ] Google Gemini API key
- [ ] Judge0 API key
- [ ] Stripe account (live mode)
- [ ] SendGrid API key
- [ ] AWS S3 bucket for uploads
- [ ] Sentry DSN for error tracking

### DNS & SSL
- [ ] Domain registered (bluelearnerhub.com)
- [ ] A records pointing to load balancer IPs
- [ ] SSL certificates (Let's Encrypt via cert-manager)
- [ ] WWW redirect configured

---

## 🏗️ Infrastructure Architecture

```
Internet
    ↓
CloudFlare / AWS CloudFront (CDN + DDoS)
    ↓
Ingress Controller (NGINX / AWS ALB)
    ↓
┌─────────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │    Backend   │  │  AI Services │  │
│  │   (3 pods)   │  │   (3 pods)   │  │   (2 pods)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           ↓                 ↓                ↓          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (M10+)                  │   │
│  └─────────────────────────────────────────────────┘   │
│           ↓                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │            Redis (ElastiCache)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Resource Requirements

### Minimum Production Specs

| Component | CPU | Memory | Storage | Replicas |
|-----------|-----|--------|---------|----------|
| Frontend | 100m | 256Mi | - | 3 |
| Backend | 250m | 512Mi | 50Gi (PVC) | 3 |
| AI Services | 250m | 256Mi | - | 2 |
| MongoDB | 2 cores | 4GB | 100GB SSD | 3 (replica set) |
| Redis | 500m | 1GB | 10GB | 2 (HA) |

---

## 🔐 Security Configuration

### Network Policies
```yaml
# Restrict pod-to-pod communication
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
  namespace: bluelearnerhub
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: mongodb
        - podSelector:
            matchLabels:
              app: redis
```

### Rate Limiting
- API: 100 requests/minute per IP
- Auth endpoints: 5 requests/minute per IP
- Global: 1000 requests/minute across all IPs

---

## 📈 Monitoring & Alerting

### Key Metrics to Watch
| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | > 1% | > 5% |
| Response Time (p95) | > 500ms | > 1s |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Disk Usage | > 80% | > 90% |

### Log Aggregation
- Application logs → Fluentd → Elasticsearch
- Access logs → S3 for long-term storage
- Audit logs → Separate retention (1 year)

---

## 🔄 Backup & Recovery

### Automated Backups
- **Frequency**: Daily at 2 AM UTC
- **Retention**: 7 days (daily), 30 days (weekly), 1 year (monthly)
- **Storage**: S3 with cross-region replication
- **Encryption**: AES-256

### Recovery Procedures
```bash
# 1. List available backups
aws s3 ls s3://bluelearnerhub-backups/backups/mongodb/daily/

# 2. Download backup
aws s3 cp s3://bluelearnerhub-backups/backups/mongodb/daily/bluelearnerhub_daily_20240115_020000.tar.gz .

# 3. Restore to database
./devops/backup/restore.sh bluelearnerhub_daily_20240115_020000.tar.gz
```

### Disaster Recovery RTO/RPO
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 24 hours

---

## 🚨 Incident Response

### Severity Levels
- **P0 (Critical)**: Platform down, data loss, security breach
- **P1 (High)**: Major feature broken, performance severely degraded
- **P2 (Medium)**: Minor feature issues, partial degradation
- **P3 (Low)**: Cosmetic issues, feature requests

### Escalation Path
1. On-call engineer (Slack + PagerDuty)
2. Tech lead (if unresolved in 30 min)
3. Engineering manager (if unresolved in 1 hour)

---

## 📞 Support Contacts

| Service | Contact | Escalation |
|---------|---------|------------|
| MongoDB Atlas | support@mongodb.com | +1-844-666-4632 |
| AWS | AWS Support Console | Enterprise support |
| Stripe | support@stripe.com | +1-888-963-8442 |

---

## 📝 Post-Deployment Verification

```bash
# 1. Health checks
curl https://api.bluelearnerhub.com/api/health
curl https://bluelearnerhub.com/api/health

# 2. Test authentication
curl -X POST https://api.bluelearnerhub.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Test AI service
curl https://ai-services.bluelearnerhub.com/health

# 4. Verify SSL
curl -I https://bluelearnerhub.com | grep -i "strict-transport-security"

# 5. Check rate limiting
curl -I https://api.bluelearnerhub.com/api/health | grep -i "x-ratelimit"
```

---

## 🔄 Maintenance Windows

- **Database maintenance**: Sundays 2-4 AM UTC
- **Application updates**: Wednesdays 3-5 AM UTC
- **No deployments**: Friday afternoons, weekends

---

## 📚 Additional Resources

- [Architecture Overview](./backend/ARCHITECTURE.md)
- [AI Services Documentation](./worker/ai-services/ARCHITECTURE.md)
- [Security Runbook](./devops/docs/security-runbook.md)
- [Troubleshooting Guide](./devops/docs/troubleshooting.md)
