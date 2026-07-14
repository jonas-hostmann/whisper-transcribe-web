FROM python:3.11-slim

# Systemabhängigkeiten für Whisper & Audio-Processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
# setuptools <70 weil Whisper's setup.py pkg_resources braucht (in setuptools 70+ entfernt)
RUN pip install --upgrade pip && \
    pip install "setuptools<70" wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Upload-Ordner erstellen
RUN mkdir -p uploads

EXPOSE 5000

CMD ["python", "app.py"]
