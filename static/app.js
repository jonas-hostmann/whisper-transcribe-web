const recordBtn = document.getElementById('recordBtn');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTime = document.getElementById('recordingTime');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const textOutput = document.getElementById('textOutput');
const copyBtn = document.getElementById('copyBtn');
const copyFeedback = document.getElementById('copyFeedback');
const newTranscriptionBtn = document.getElementById('newTranscriptionBtn');

let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let recordingTimer = null;
let isRecording = false;

// ===== Aufnahme =====
recordBtn.addEventListener('click', async () => {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
});

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
            uploadFile(file);
            stream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = Date.now();

        // UI-Updates
        recordBtn.querySelector('.record-btn-inner').innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
        `;
        recordBtn.querySelector('.record-label').textContent = 'Stop';
        recordingIndicator.classList.add('active');

        // Timer
        recordingTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
            const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const s = String(elapsed % 60).padStart(2, '0');
            recordingTime.textContent = `${m}:${s}`;
        }, 1000);

    } catch (err) {
        showToast('Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff.');
        console.error(err);
    }
}

function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
    mediaRecorder.stop();
    isRecording = false;
    clearInterval(recordingTimer);

    // UI-Reset
    recordBtn.querySelector('.record-btn-inner').innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        </svg>
    `;
    recordBtn.querySelector('.record-label').textContent = 'Aufnehmen';
    recordingIndicator.classList.remove('active');
    recordingTime.textContent = '00:00';
}

// ===== Datei-Upload =====
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
});

// Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
});

// ===== Upload & Transkription =====
function uploadFile(file) {
    // Validierung
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp4', 'audio/webm', 'audio/ogg', 'audio/x-m4a', 'audio/aac'];
    const validExts = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.aac'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    const isValid = validTypes.includes(file.type) || validExts.includes(ext);
    if (!isValid) {
        showToast('Bitte lade eine gültige Audio-Datei hoch.');
        return;
    }

    // UI-Wechsel
    uploadSection.style.display = 'none';
    loadingSection.style.display = 'block';
    resultSection.style.display = 'none';

    const formData = new FormData();
    formData.append('audio', file);

    fetch('/transcribe', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        loadingSection.style.display = 'none';
        if (data.success) {
            textOutput.textContent = data.text;
            resultSection.style.display = 'block';
        } else {
            showToast(data.error || 'Transkription fehlgeschlagen.');
            uploadSection.style.display = 'block';
        }
    })
    .catch(err => {
        loadingSection.style.display = 'none';
        uploadSection.style.display = 'block';
        showToast('Netzwerkfehler. Bitte versuche es erneut.');
        console.error(err);
    });
}

// ===== Kopieren =====
copyBtn.addEventListener('click', () => {
    const text = textOutput.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        copyFeedback.classList.add('show');
        setTimeout(() => copyFeedback.classList.remove('show'), 2000);
    });
});

// ===== Neue Transkription =====
newTranscriptionBtn.addEventListener('click', () => {
    resultSection.style.display = 'none';
    uploadSection.style.display = 'block';
    textOutput.textContent = '';
    fileInput.value = '';
});

// ===== Toast =====
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== Tastenkürzel =====
document.addEventListener('keydown', (e) => {
    // Esc stoppt Aufnahme
    if (e.key === 'Escape' && isRecording) {
        stopRecording();
    }
    // Strg/Cmd + C kopiert Ergebnis
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && resultSection.style.display !== 'none') {
        if (window.getSelection().toString().length === 0) {
            copyBtn.click();
        }
    }
});

console.log('🎙️ Whisper Transcribe Web geladen');
