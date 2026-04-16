#!/usr/bin/env bash
# Panaversity Hackathon II — Minikube local cluster bootstrap
set -euo pipefail

echo "▶ Starting Minikube with sufficient resources..."
minikube start \
  --cpus=4 \
  --memory=6144 \
  --driver=docker \
  --addons=ingress,ingress-dns,metrics-server

echo "▶ Enabling Minikube Docker daemon..."
eval "$(minikube docker-env)"

echo "▶ Installing Dapr CLI (if not present)..."
if ! command -v dapr &>/dev/null; then
  curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | bash
fi

echo "▶ Initializing Dapr on Kubernetes..."
dapr init --kubernetes --wait

echo "▶ Building Docker images..."
docker build -f Dockerfile.backend  -t hackathon-2-backend:latest  .
docker build -f Dockerfile.frontend -t hackathon-2-frontend:latest .

echo "▶ Applying namespace..."
kubectl apply -f k8s/namespace.yaml

echo "▶ Applying secrets (from secret.yaml.template — edit first!)..."
if [ -f k8s/secret.yaml ]; then
  kubectl apply -f k8s/secret.yaml
else
  echo "⚠  k8s/secret.yaml not found. Copy secret.yaml.template → secret.yaml and fill in values."
  exit 1
fi

echo "▶ Applying Dapr components..."
kubectl apply -f k8s/dapr/ -n hackathon-2

echo "▶ Applying workloads..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml

echo "▶ Waiting for deployments..."
kubectl rollout status deployment/backend  -n hackathon-2 --timeout=120s
kubectl rollout status deployment/frontend -n hackathon-2 --timeout=120s

echo ""
echo "✅ Done! Add to /etc/hosts:"
echo "   $(minikube ip)  todo.local"
echo ""
echo "   Frontend → http://todo.local"
echo "   Backend  → http://todo.local/api"
