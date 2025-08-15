#!/usr/bin/env bash
set -o errexit  # exit on error

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start FastAPI app with uvicorn
uvicorn backend.ai_service.app:app --host 0.0.0.0 --port 10000

