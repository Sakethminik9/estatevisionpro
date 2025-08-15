#!/bin/bash

# Install Python dependencies
pip install -r backend/ai_service/requirements.txt

# Start AI service in the background
python3 backend/ai_service/app.py &

# Start Node.js backend
cd backend
npm install
node server.js

