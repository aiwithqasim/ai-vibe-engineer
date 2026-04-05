# Stage 1: build the Next.js frontend as a static export
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: install Python dependencies with uv
FROM python:3.12-slim AS python-deps
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY backend/pyproject.toml ./
RUN uv pip install --system --no-cache \
    "fastapi>=0.115" \
    "uvicorn[standard]>=0.34" \
    "python-multipart>=0.0.20" \
    "PyJWT>=2.9"

# Stage 3: final runtime image
FROM python:3.12-slim
WORKDIR /app
ENV DATA_DIR=/app/data

COPY --from=python-deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=python-deps /usr/local/bin/uvicorn /usr/local/bin/uvicorn

COPY backend/ ./backend/

# Copy the static export produced by Next.js into the directory FastAPI serves
COPY --from=frontend-builder /app/frontend/out ./backend/static

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
