#!/usr/bin/env bash
set -o errexit  # exit on error

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start Flask app (try common locations)
if [ -f "app.py" ]; then
  exec python app.py
elif [ -f "backend/ai_service/app.py" ]; then
  exec python backend/ai_service/app.py
else
  echo "ERROR: Could not find Flask entry file (app.py)."
  echo "Checked: ./app.py and ./backend/ai_service/app.py"
  echo "If your file is elsewhere, edit start_render.sh to point to it."
  exit 1
fi
