#!/bin/bash
set -e

echo "--- Starting build-time dependency (backend) ---"
docker compose up -d backend

echo "--- Waiting for backend to be healthy... ---"

wait_for_service() {
  local service_name=$1
  echo "Waiting for '$service_name'..."
  for i in {1..30}; do
    container_id=$(docker compose ps -q "$service_name")

    if [ -z "$container_id" ]; then
      echo "ERROR: Container for '$service_name' is not running. It might have crashed."
      echo "Run 'docker compose logs $service_name' to see the container logs for debugging."
      exit 1
    fi

    health_status=$(docker inspect -f '{{.State.Health.Status}}' "$container_id")

    if [ "$health_status" == "healthy" ]; then
      echo "'$service_name' is healthy."
      return 0
    fi
    echo "Waiting for '$service_name' to be healthy. Current status: '$health_status' ($i/30)"
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