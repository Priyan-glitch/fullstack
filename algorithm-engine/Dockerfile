# ── Stage 1: Build deps ───────────────────────────────────────────────────────
FROM python:3.11-slim AS build

WORKDIR /app

# Install dependencies into a separate dir for clean copying
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Run ──────────────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy installed packages from build stage
COPY --from=build /install /usr/local

# Copy application source
COPY app ./app

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8090

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8090"]
