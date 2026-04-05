#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
docker compose up --build -d
echo "Kanban Studio is running at http://localhost:8000"
