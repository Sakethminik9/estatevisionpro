#!/usr/bin/env bash
set -o errexit  # exit on error

# 1️⃣ Upgrade pip & install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 2️⃣ Set Flask app path (adjust if needed)
export FLASK_APP=backend/ai_service/app.py
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=10000

# 3️⃣ Start Flask
flask run

