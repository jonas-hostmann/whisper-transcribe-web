from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import whisper
import os
import uuid
import tempfile

app = Flask(__name__)
CORS(app)

# Whisper-Modell laden ("base" für gute Balance aus Speed & Qualität, "small" für besser)
print("⏳ Lade Whisper-Modell...")
model = whisper.load_model("small")
print("✅ Whisper-Modell geladen!")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "Keine Audiodatei hochgeladen"}), 400
    
    file = request.files["audio"]
    
    if file.filename == "":
        return jsonify({"error": "Leere Datei"}), 400
    
    # Temporäre Datei speichern
    ext = os.path.splitext(file.filename)[1].lower()
    if not ext:
        ext = ".webm"
    
    temp_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}{ext}")
    file.save(temp_path)
    
    try:
        # Transkription durchführen
        result = model.transcribe(temp_path, language="de")
        text = result["text"].strip()
        
        return jsonify({
            "success": True,
            "text": text,
            "language": result.get("language", "unknown")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Aufräumen
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
