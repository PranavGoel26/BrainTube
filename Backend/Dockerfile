FROM python:3.11-slim

# Install system dependencies including Rust build tools for fastembed 
RUN apt-get update && apt-get install -y ffmpeg curl gcc python3-dev rustc cargo nodejs && rm -rf /var/lib/apt/lists/*

# Fix Render RO-filesystem issues by setting CARGO_HOME to /tmp
ENV CARGO_HOME=/tmp/.cargo
RUN mkdir -p /tmp/.cargo

# Set working directory
WORKDIR /app

# Upgrade pip and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Cloud Run sets the PORT environment variable. Default to 8080.
ENV PORT 8080

# Command to run the FastApi application
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
