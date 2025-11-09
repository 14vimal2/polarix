#!/bin/bash
set -e

echo "--- Starting build-time dependency (backend) ---"
docker compose up -d backend

echo "--- Waiting for backend to be healthy... ---"

wait_for_service() {
  local service_name=$1
  echo "Waiting for '$service_name'..."
  for i in {1..30}; do
    if [ "$(docker compose ps -q $service_name | xargs docker inspect -f '{{.State.Health.Status}}')" == "healthy" ]; then
      echo "'$service_name' is healthy."
      return 0
    fi
    sleep 5
  done
  echo "ERROR: Timeout waiting for '$service_name' to become healthy."
  exit 1
}
wait_for_service backend

echo "--- Backend is healthy. Building frontend... ---"
docker compose build frontend

echo "--- Cleaning up build dependencies... ---"
docker compose down

echo "✅ Build complete. You can now run 'docker compose up'."