# Whisper Transcribe Web

Eine elegante Web-App für die automatische Sprach-zu-Text-Transkription mit OpenAI Whisper.

## Features

- 🎙️ **Sprachmemo-Aufnahme** direkt im Browser oder Datei-Upload
- 🤖 **KI-Transkription** via OpenAI Whisper (lokal, kein API-Key nötig)
- 🌙 **Apple-Design Darkmode** mit Glas-Effekten
- 📋 **One-Click Copy** des transkribierten Textes
- 🐳 **Docker-Ready** für Coolify & VPS-Deployment

## Coolify Deployment

1. In Coolify: **Neuer Service → Git Repository**
2. Repository-URL: `https://github.com/jonas-hostmann/whisper-transcribe-web`
3. Branch: `main`
4. **Deploy** klicken – fertig!

## Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/jonas-hostmann/whisper-transcribe-web.git
cd whisper-transcribe-web

# Virtuelle Umgebung (empfohlen)
python -m venv venv
source venv/bin/activate

# Abhängigkeiten installieren
pip install -r requirements.txt

# App starten
python app.py
```

> **Hinweis:** Beim ersten Start wird das Whisper-Modell automatisch heruntergeladen (~460 MB).

## Umgebungsvariablen

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `WHISPER_MODEL` | `small` | Modell-Größe: `tiny`, `base`, `small`, `medium`, `large` |
| `PORT` | `5000` | Server-Port |

## Tech Stack

- **Backend:** Python, Flask, OpenAI Whisper
- **Frontend:** Vanilla JS, Apple-Design Darkmode UI
- **Container:** Docker
