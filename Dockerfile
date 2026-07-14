FROM python:3.11-slim

# Systemabhängigkeiten für Whisper & Audio-Processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Upload-Ordner erstellen
RUN mkdir -p uploads

EXPOSE 5000

CMD ["python", "app.py"]
