// ============================================================
// DOG COURT — Main Application Logic
// ============================================================

const APP = {
    geminiKey: null,
    elevenLabsKey: null,
    imageFile: null,
    imageBase64: null,
    trialData: null,
    audioBlob: null,
    audioElement: null,
    isPlaying: false,
};

// Voice IDs for ElevenLabs (default library voices — valid until Dec 2026)
// These are pre-made voices available on all accounts
const VOICES = {
    judge: 'pNInz6obpgDQGcFmaJgB', // Adam - deep, authoritative male
    defense: 'ErXwobaYiN019PkySvjV', // Antoni - energetic, expressive male
    prosecution: 'EXAVITQu4vr4xnSDxMaL', // Sarah - emotional female
    defendant: 'IKne3meq5aSn9XLyUdCD', // Charlie - young, innocent male
};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadSavedKeys();
    setupEventListeners();
});

function loadSavedKeys() {
    APP.geminiKey = localStorage.getItem('dogcourt_gemini_key') || '';
    APP.elevenLabsKey = localStorage.getItem('dogcourt_elevenlabs_key') || '';

    const geminiInput = document.getElementById('gemini-key');
    const elevenInput = document.getElementById('elevenlabs-key');

    if (APP.geminiKey) geminiInput.value = APP.geminiKey;
    if (APP.elevenLabsKey) elevenInput.value = APP.elevenLabsKey;
}

function setupEventListeners() {
    // Upload zone
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const btnBrowse = document.getElementById('btn-browse');

    uploadZone.addEventListener('click', () => fileInput.click());
    btnBrowse.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageSelected(file);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageSelected(e.target.files[0]);
        }
    });

    // File charges button
    document.getElementById('btn-file-charges').addEventListener('click', startTrial);

    // Save keys
    document.getElementById('btn-save-keys').addEventListener('click', saveKeys);

    // Audio controls
    document.getElementById('btn-play').addEventListener('click', togglePlayback);

    // New trial
    document.getElementById('btn-new-trial').addEventListener('click', resetToUpload);

    // Share
    document.getElementById('btn-share').addEventListener('click', shareVerdict);

    // Waveform seek
    document.getElementById('waveform').addEventListener('click', seekAudio);
}

// ============================================================
// IMAGE HANDLING
// ============================================================

function handleImageSelected(file) {
    APP.imageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        APP.imageBase64 = e.target.result.split(',')[1]; // Remove data:image/...;base64, prefix
        const previewImg = document.getElementById('preview-img');
        previewImg.src = e.target.result;

        document.getElementById('upload-zone').classList.add('hidden');
        document.getElementById('preview-area').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// ============================================================
// API KEY MANAGEMENT
// ============================================================

function saveKeys() {
    const geminiKey = document.getElementById('gemini-key').value.trim();
    const elevenKey = document.getElementById('elevenlabs-key').value.trim();

    if (geminiKey) {
        APP.geminiKey = geminiKey;
        localStorage.setItem('dogcourt_gemini_key', geminiKey);
    }
    if (elevenKey) {
        APP.elevenLabsKey = elevenKey;
        localStorage.setItem('dogcourt_elevenlabs_key', elevenKey);
    }

    alert('Keys saved! They are stored locally in your browser.');
}

// ============================================================
// TRIAL FLOW
// ============================================================

async function startTrial() {
    // Validate keys
    APP.geminiKey = document.getElementById('gemini-key').value.trim() || APP.geminiKey;
    APP.elevenLabsKey = document.getElementById('elevenlabs-key').value.trim() || APP.elevenLabsKey;

    if (!APP.geminiKey || !APP.elevenLabsKey) {
        alert('Please enter both API keys first (expand the API Keys section below the upload area).');
        return;
    }

    if (!APP.imageBase64) {
        alert('Please upload a crime scene photo first.');
        return;
    }

    // Switch to processing screen
    showScreen('screen-processing');

    try {
        // Step 1: Analyze crime scene with Gemini
        setStep('step-analyze', 'active');
        updateStatus('Analyzing the crime scene...');
        const crimeAnalysis = await analyzeCrimeScene();

        setStep('step-analyze', 'done');

        // Step 2: Generate courtroom script
        setStep('step-script', 'active');
        updateStatus('Writing the courtroom script...');
        const script = await generateScript(crimeAnalysis);
        APP.trialData = script;

        setStep('step-script', 'done');

        // Step 3: Generate voice audio via Text-to-Dialogue
        setStep('step-voices', 'active');
        updateStatus('Voice-acting the trial...');
        const audioBlob = await generateDialogueAudio(script);
        APP.audioBlob = audioBlob;

        setStep('step-voices', 'done');

        // Step 4: Done (sound effects are optional/enhancement)
        setStep('step-sfx', 'active');
        updateStatus('Preparing the courtroom...');
        await new Promise(r => setTimeout(r, 1000));
        setStep('step-sfx', 'done');

        // Show trial screen
        displayTrial();

    } catch (error) {
        console.error('Trial failed:', error);
        alert(`Trial failed: ${error.message}\n\nPlease check your API keys and try again.`);
        showScreen('screen-upload');
    }
}

// ============================================================
// GEMINI API — Crime Scene Analysis
// ============================================================

async function analyzeCrimeScene() {
    const prompt = `You are a forensic investigator for DOG COURT. Analyze this image of a dog's "crime scene."

Identify:
1. What the dog did (the "crime" - e.g., chewed shoe, destroyed pillow, stole food)
2. The evidence visible in the photo
3. The dog's breed (best guess) and name suggestion
4. The estimated "damage" in a humorous way

Respond in JSON format:
{
    "crime": "brief description of what the dog did",
    "evidence": ["list", "of", "visible", "evidence"],
    "dog_breed": "best guess breed",
    "dog_name": "a funny name for the defendant",
    "damage_description": "humorous damage assessment",
    "severity": "misdemeanor" or "felony" (for comedy)
}

Be funny and dramatic. This is for a comedy courtroom drama.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APP.geminiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: APP.imageFile.type,
                                data: APP.imageBase64
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.9,
                    responseMimeType: 'application/json'
                }
            })
        }
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Gemini API error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
}

// ============================================================
// GEMINI API — Script Generation
// ============================================================

async function generateScript(crimeAnalysis) {
    const prompt = `You are a comedy writer for DOG COURT, a hilarious courtroom drama where dogs are put on trial for their "crimes."

Based on this crime analysis:
${JSON.stringify(crimeAnalysis, null, 2)}

Write a courtroom script with exactly these characters:
- JUDGE (stern, dry humor, world-weary)
- DEFENSE (the dog's lawyer - theatrical, uses absurd legal arguments)
- PROSECUTION (the human owner - exasperated, emotional about their destroyed item)
- DEFENDANT (the dog - confused but endearing, speaks in simple sentences)

The script should be:
- 6-10 dialogue lines total (keep it punchy, under 1800 characters total for all dialogue)
- Genuinely funny with unexpected legal arguments
- End with a verdict (90% of the time: NOT GUILTY with a ridiculous reason)
- Include stage directions in square brackets for tone

Respond in JSON format:
{
    "case_number": "random 3-digit number",
    "case_title": "The People vs. [Dog Name]",
    "charge": "formal-sounding charge (humorous)",
    "dialogue": [
        {
            "speaker": "judge" | "defense" | "prosecution" | "defendant",
            "emotion": "emotion/direction tag",
            "line": "the spoken dialogue"
        }
    ],
    "verdict": "NOT GUILTY" or "GUILTY",
    "verdict_reason": "humorous one-line reason for verdict"
}

IMPORTANT: Keep each line under 250 characters. Total dialogue under 1800 characters. Be genuinely funny!`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APP.geminiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 1.0,
                    responseMimeType: 'application/json'
                }
            })
        }
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Gemini script error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
}

// ============================================================
// ELEVENLABS API — Text-to-Dialogue
// ============================================================

async function generateDialogueAudio(script) {
    // Build the inputs array for Text-to-Dialogue API
    const inputs = script.dialogue.map(line => {
        const voiceId = VOICES[line.speaker] || VOICES.judge;
        const emotionTag = line.emotion ? `[${line.emotion}] ` : '';
        return {
            text: `${emotionTag}${line.line}`,
            voice_id: voiceId
        };
    });

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-dialogue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': APP.elevenLabsKey
        },
        body: JSON.stringify({ inputs })
    });

    if (!response.ok) {
        const errText = await response.text();
        let errMsg = response.statusText;
        try {
            const errJson = JSON.parse(errText);
            errMsg = errJson.detail?.message || errJson.detail || errMsg;
        } catch (e) { /* ignore */ }
        throw new Error(`ElevenLabs error: ${errMsg}`);
    }

    return await response.blob();
}

// ============================================================
// DISPLAY TRIAL
// ============================================================

function displayTrial() {
    const trial = APP.trialData;

    // Set case info
    document.getElementById('case-number').textContent = `Case #${trial.case_number}`;
    document.getElementById('case-title').textContent = trial.case_title;
    document.getElementById('case-charge').textContent = `Charge: ${trial.charge}`;

    // Set evidence image
    document.getElementById('evidence-img').src = document.getElementById('preview-img').src;

    // Build transcript
    const transcriptEl = document.getElementById('transcript');
    transcriptEl.innerHTML = '';

    const speakerIcons = {
        judge: '🧑‍⚖️',
        defense: '🦮',
        prosecution: '👤',
        defendant: '🐕'
    };

    const speakerNames = {
        judge: 'Judge Barksworth',
        defense: 'Defense Attorney Rex',
        prosecution: 'The Prosecution',
        defendant: 'The Defendant'
    };

    trial.dialogue.forEach((line, i) => {
        const div = document.createElement('div');
        div.className = 'transcript-line';
        div.dataset.index = i;
        div.innerHTML = `
            <span class="speaker-icon">${speakerIcons[line.speaker] || '👤'}</span>
            <div class="line-content">
                <div class="speaker-name">${speakerNames[line.speaker] || line.speaker}</div>
                <div class="speaker-text">${line.line}</div>
            </div>
        `;
        transcriptEl.appendChild(div);
    });

    // Set verdict
    const verdictStamp = document.getElementById('verdict-stamp');
    verdictStamp.textContent = trial.verdict;
    verdictStamp.className = 'verdict-stamp' + (trial.verdict === 'GUILTY' ? ' guilty' : '');
    document.getElementById('verdict-reason').textContent = trial.verdict_reason;

    // Setup audio
    if (APP.audioBlob) {
        const audioUrl = URL.createObjectURL(APP.audioBlob);
        APP.audioElement = new Audio(audioUrl);
        APP.audioElement.addEventListener('timeupdate', updateAudioProgress);
        APP.audioElement.addEventListener('ended', onAudioEnded);
        APP.audioElement.addEventListener('loadedmetadata', () => {
            updateTimeDisplay();
        });
    }

    // Show trial screen
    showScreen('screen-trial');
}

// ============================================================
// AUDIO PLAYBACK
// ============================================================

function togglePlayback() {
    if (!APP.audioElement) return;

    const btn = document.getElementById('btn-play');

    if (APP.isPlaying) {
        APP.audioElement.pause();
        btn.textContent = '▶';
        APP.isPlaying = false;
    } else {
        APP.audioElement.play();
        btn.textContent = '⏸';
        APP.isPlaying = true;

        // Show verdict after audio plays
        document.getElementById('verdict-panel').classList.remove('hidden');
    }
}

function updateAudioProgress() {
    if (!APP.audioElement) return;

    const progress = (APP.audioElement.currentTime / APP.audioElement.duration) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    updateTimeDisplay();

    // Highlight current transcript line (approximate)
    highlightCurrentLine();
}

function updateTimeDisplay() {
    if (!APP.audioElement) return;

    const current = formatTime(APP.audioElement.currentTime);
    const total = formatTime(APP.audioElement.duration || 0);
    document.getElementById('time-display').textContent = `${current} / ${total}`;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function highlightCurrentLine() {
    if (!APP.audioElement || !APP.trialData) return;

    const lines = document.querySelectorAll('.transcript-line');
    const totalLines = lines.length;
    const progress = APP.audioElement.currentTime / APP.audioElement.duration;
    const currentIndex = Math.min(Math.floor(progress * totalLines), totalLines - 1);

    lines.forEach((line, i) => {
        line.classList.remove('active');
        if (i < currentIndex) {
            line.classList.add('played');
        } else if (i === currentIndex) {
            line.classList.add('active', 'played');
        }
    });
}

function onAudioEnded() {
    APP.isPlaying = false;
    document.getElementById('btn-play').textContent = '▶';
    document.getElementById('verdict-panel').classList.remove('hidden');

    // Mark all lines as played
    document.querySelectorAll('.transcript-line').forEach(l => {
        l.classList.add('played');
        l.classList.remove('active');
    });
}

function seekAudio(e) {
    if (!APP.audioElement) return;

    const waveform = document.getElementById('waveform');
    const rect = waveform.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    APP.audioElement.currentTime = percent * APP.audioElement.duration;
}

// ============================================================
// NAVIGATION & UTILS
// ============================================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function setStep(stepId, state) {
    const step = document.getElementById(stepId);
    step.classList.remove('active', 'done');
    step.classList.add(state);
}

function updateStatus(text) {
    document.getElementById('processing-status').textContent = text;
}

function resetToUpload() {
    // Reset state
    APP.imageFile = null;
    APP.imageBase64 = null;
    APP.trialData = null;
    APP.audioBlob = null;
    if (APP.audioElement) {
        APP.audioElement.pause();
        APP.audioElement = null;
    }
    APP.isPlaying = false;

    // Reset UI
    document.getElementById('upload-zone').classList.remove('hidden');
    document.getElementById('preview-area').classList.add('hidden');
    document.getElementById('verdict-panel').classList.add('hidden');
    document.getElementById('file-input').value = '';

    // Reset progress steps
    document.querySelectorAll('.progress-steps .step').forEach(s => {
        s.classList.remove('active', 'done');
    });

    showScreen('screen-upload');
}

function shareVerdict() {
    if (!APP.trialData) return;

    const text = `🏛️ DOG COURT VERDICT\n\n${APP.trialData.case_title}\nCharge: ${APP.trialData.charge}\n\nVerdict: ${APP.trialData.verdict}\nReason: ${APP.trialData.verdict_reason}\n\n⚖️ Try it yourself: [URL]`;

    if (navigator.share) {
        navigator.share({ text });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Verdict copied to clipboard!');
        });
    }
}
