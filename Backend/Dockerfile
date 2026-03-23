FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Cloud Run sets the PORT environment variable. Default to 8080.
ENV PORT 8080

# Command to run the FastApi application
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
