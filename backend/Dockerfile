# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY backend/ ./

# Collect static
RUN python manage.py collectstatic --noinput

# Runtime env
ENV DJANGO_SETTINGS_MODULE=skill_sync.settings

# Expose port
EXPOSE 8000

# Start gunicorn (bind to $PORT if present, else 8000)
CMD gunicorn skill_sync.wsgi:application -w 2 -k gthread -b 0.0.0.0:${PORT:-8000}