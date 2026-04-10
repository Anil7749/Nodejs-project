# 🚀 End-to-End AWS DevOps Project

A complete, production-ready DevOps implementation on AWS — covering network design, containerization, and fully automated CI/CD deployments.

---

## 📌 Project Overview

This project deploys a containerized full-stack application on AWS using a secure, scalable, and automated infrastructure. The architecture separates concerns clearly: an Application Load Balancer (ALB) handles public traffic, while application containers run in private subnets for security. Deployments are fully automated via GitHub Actions — no manual steps required.

---

## 🏗️ Architecture

```
User → ALB → Frontend (Nginx) → Backend (Node.js API) → MongoDB Atlas
```

**Deployment Flow:**
```
GitHub Push
    ↓
GitHub Actions (CI/CD)
    ↓
Build Docker Images
    ↓
Push to Amazon ECR
    ↓
Update ECS Services
    ↓
Application Live
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Cloud | AWS |
| CI/CD | GitHub Actions |
| Containers | Docker + Amazon ECS (Fargate) |
| Container Registry | Amazon ECR |
| Database | MongoDB Atlas |
| Frontend | Nginx (multi-stage Docker build) |
| Backend | Node.js / Express |

---

## AWS Infrastructure

### Networking
- **Custom VPC** — CIDR `10.0.0.0/16` with DNS resolution enabled
- **2 Public Subnets** — host the ALB (internet-facing)
- **2 Private Subnets** — host ECS containers (secure layer)
- **Internet Gateway** — attached to VPC for public subnet access
- **Route Tables** — public routes to IGW; private subnets have no direct internet access

### Security Groups
| Resource | Rule |
|---|---|
| ALB | Inbound HTTP (Port 80) from `0.0.0.0/0` |
| ECS Tasks | Inbound Port 3000 from ALB Security Group only |

### ECS & ECR
- **Cluster:** `nodeapp-cluster` (Fargate launch type — no server management)
- **ECR Repositories:** `nodeapp-frontend` and `nodeapp-backend`
- **Task Definitions:**
  - Backend: Port 3000, `MONGODB_URI` env var, image from ECR
  - Frontend: Port 80, image from ECR
- **Services:** Frontend and Backend services, each in private subnets with ALB integration

### Load Balancer
- ALB in public subnets, listener on port 80
- **Routing rules:**
  - `/api/*` → Backend Target Group (Port 3000, health check: `/api/health`)
  - Default → Frontend Target Group (Port 80)

### Database
- MongoDB Atlas cluster with connection string injected as an ECS environment variable (`MONGODB_URI`)

---

## Dockerization

**Backend** — `node:18-alpine` base image, exposes port 3000, runs Express server.

**Frontend** — Multi-stage build: Node for building assets, Nginx for serving. Results in a smaller, production-optimized image.

---

## CI/CD Pipeline (GitHub Actions)

The pipeline is triggered on every push to the `main` branch and fully automates build and deployment.

**Pipeline file:** `.github/workflows/deploy.yml`

### Stages

1. **Checkout Code** — pulls the latest codebase
2. **Configure AWS Credentials** — uses IAM credentials from GitHub Secrets
3. **Login to Amazon ECR** — authenticates Docker with ECR
4. **Build Docker Images** — builds frontend and backend images
5. **Push Images to ECR** — pushes both images to their respective repositories
6. **Deploy to ECS** — triggers a new deployment via `aws ecs update-service --force-new-deployment`

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | AWS region |
| `ECS_CLUSTER` | ECS cluster name |
| `ECS_BACKEND_SERVICE` | ECS backend service name |
| `ECS_FRONTEND_SERVICE` | ECS frontend service name |
| `ECR_BACKEND` | ECR backend repository URI |
| `ECR_FRONTEND` | ECR frontend repository URI |

---

## Security Best Practices

- IAM user used for CI/CD instead of root account
- All secrets stored in GitHub Secrets (never hardcoded)
- ECS containers run in private subnets — not directly exposed to the internet
- Security groups enforce least-privilege access (only ALB can reach ECS)

---

## Key Learnings

Throughout this project, real-world issues were encountered and resolved:
- Health check failures and load balancer misconfigurations
- IAM permission errors for ECS and ECR access
- Networking issues between subnets and services

These debugging experiences were some of the most valuable parts of the project.

