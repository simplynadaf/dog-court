// ============================================================
// PawWise — AI Vet Friend
// ============================================================

// DEV MODE: Set to true to use local Bedrock proxy instead of Gemini
const DEV_MODE = true;
const PROXY_URL = 'http://localhost:5555';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Pre-baked demos (work without any API keys)
const DEMO_DATA = {
    health: { json: 'demo/health.json', audio: 'demo/health.mp3' },
    behavior: { json: 'demo/behavior.json', audio: 'demo/behavior.mp3' },
    emergency: { json: 'demo/emergency.json', audio: 'demo/emergency.mp3' },
    court: { json: 'demo/court.json', audio: 'demo/court.mp3' },
};

const STATE = {
    mode: 'health', // health | behavior | emergency | court
    geminiKey: null,
    elevenLabsKey: null,
    imageFile: null,
    imageBase64: null,
    audioElement: null,
    isPlaying: false,
};

// Mode configurations
const MODES = {
    health: {
        title: 'Health Check',
        subtitle: 'Upload a photo of your dog. AI will assess body condition, coat health, posture, and flag anything to watch for.',
        btnText: 'Check Health',
        showUpload: true,
        showText: false,
        inputHint: '',
    },
    behavior: {
        title: 'Behavior Decoder',
        subtitle: 'Why is your dog doing that? Describe the behavior or upload a photo — get breed-specific explanations and advice.',
        btnText: 'Explain Behavior',
        showUpload: true,
        showText: true,
        inputHint: 'E.g., "My 2-year-old lab barks at every person who walks past the window"',
    },
    emergency: {
        title: 'Emergency Triage',
        subtitle: 'Worried something is wrong? Describe the situation for an urgency assessment and first-aid guidance.',
        btnText: '🚨 Assess Urgency',
        showUpload: true,
        showText: true,
        inputHint: 'E.g., "My dog ate a piece of dark chocolate 30 minutes ago" or "Limping on back left leg since yesterday"',
    },
    court: {
        title: 'Dog Court 🏛️',
        subtitle: 'Your dog committed a crime? Upload the evidence. AI generates a full courtroom drama with voice-acted trial.',
        btnText: '⚖️ File Charges',
        showUpload: true,
        showText: false,
        inputHint: '',
    },
};

// ElevenLabs voices
const VOICES = {
    narrator: 'pNInz6obpgDQGcFmaJgB',   // Adam - calm narrator for health/emergency
    judge: 'pNInz6obpgDQGcFmaJgB',       // Adam - deep authoritative
    defense: 'ErXwobaYiN019PkySvjV',      // Antoni - energetic
    prosecution: 'EXAVITQu4vr4xnSDxMaL',  // Sarah - emotional
    defendant: 'IKne3meq5aSn9XLyUdCD',    // Charlie - innocent
};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadKeys();
    setupModes();
    setupUpload();
    setupButtons();
});

function loadKeys() {
    STATE.geminiKey = localStorage.getItem('pawwise_gemini') || '';
    STATE.elevenLabsKey = localStorage.getItem('pawwise_eleven') || 'sk_b0d6f61247491565e30be41ba7f460099b6cacf7a9f686a1';
    if (STATE.geminiKey) document.getElementById('gemini-key').value = STATE.geminiKey;
    if (STATE.elevenLabsKey) document.getElementById('elevenlabs-key').value = STATE.elevenLabsKey;
}

// ============================================================
// MODE SWITCHING
// ============================================================

function setupModes() {
    document.querySelectorAll('.mode-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            switchMode(mode);
        });
    });
}

function switchMode(mode) {
    STATE.mode = mode;
    const config = MODES[mode];

    // Update active button
    document.querySelectorAll('.mode-card').forEach(b => b.classList.remove('active'));
    document.querySelector(`.mode-card[data-mode="${mode}"]`).classList.add('active');

    // Update description
    document.getElementById('ws-title').textContent = config.title;
    document.getElementById('ws-subtitle').textContent = config.subtitle;
    document.getElementById('btn-analyze-text').textContent = config.btnText;

    // Show/hide text input
    const textSection = document.getElementById('text-area');
    if (config.showText) {
        textSection.classList.remove('hidden');
        document.getElementById('text-hint').textContent = config.inputHint;
    } else {
        textSection.classList.add('hidden');
    }

    // Reset view
    showSection('ws-input');
}

// ============================================================
// FILE UPLOAD
// ============================================================

function setupUpload() {
    const zone = document.getElementById('upload-zone');
    const input = document.getElementById('file-input');

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    input.addEventListener('change', e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    document.getElementById('btn-remove').addEventListener('click', removeImage);
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    STATE.imageFile = file;

    const reader = new FileReader();
    reader.onload = e => {
        STATE.imageBase64 = e.target.result.split(',')[1];
        document.getElementById('preview-img').src = e.target.result;
        document.getElementById('preview').classList.remove('hidden');
        document.getElementById('upload-zone').classList.add('hidden');
        document.getElementById('btn-analyze').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    STATE.imageFile = null;
    STATE.imageBase64 = null;
    document.getElementById('preview').classList.add('hidden');
    document.getElementById('upload-zone').classList.remove('hidden');
    document.getElementById('btn-analyze').classList.add('hidden');
    document.getElementById('file-input').value = '';
}

// ============================================================
// BUTTONS & NAVIGATION
// ============================================================

function setupButtons() {
    document.getElementById('btn-analyze').addEventListener('click', analyze);
    document.getElementById('btn-demo').addEventListener('click', runDemoMode);
    document.getElementById('btn-new').addEventListener('click', resetToStart);
    document.getElementById('btn-share').addEventListener('click', share);
    document.getElementById('btn-keys').addEventListener('click', () => toggleModal(true));
    document.getElementById('btn-close-modal').addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-save-keys').addEventListener('click', saveKeys);
    document.getElementById('btn-play').addEventListener('click', toggleAudio);
    document.getElementById('modal-backdrop').addEventListener('click', () => toggleModal(false));
}

function toggleModal(show) {
    document.getElementById('keys-modal').classList.toggle('hidden', !show);
}

function saveKeys() {
    const g = document.getElementById('gemini-key').value.trim();
    const e = document.getElementById('elevenlabs-key').value.trim();
    if (g) { STATE.geminiKey = g; localStorage.setItem('pawwise_gemini', g); }
    if (e) { STATE.elevenLabsKey = e; localStorage.setItem('pawwise_eleven', e); }
    toggleModal(false);
}

function resetToStart() {
    removeImage();
    document.getElementById('situation-input').value = '';
    showSection('ws-input');
    document.getElementById('results-section').classList.add('hidden');
}

function showSection(id) {
    ['ws-input', 'ws-loading', 'ws-results'].forEach(s => {
        document.getElementById(s).classList.toggle('hidden', s !== id);
    });
}

// ============================================================
// MAIN ANALYSIS FLOW
// ============================================================

async function analyze() {
    STATE.geminiKey = document.getElementById('gemini-key').value.trim() || STATE.geminiKey;
    
    // If no API key, use pre-baked demo
    const useDemo = !STATE.geminiKey && !DEV_MODE;
    const hasInput = STATE.imageBase64 || document.getElementById('situation-input').value.trim();

    if (!useDemo && !DEV_MODE && !STATE.geminiKey) {
        // No key, no demo available for behavior mode — show demo anyway
    }

    if (!hasInput && !useDemo) {
        alert('Please upload a photo or describe the situation.');
        return;
    }

    showSection('ws-loading');
    setLoading('Analyzing your dog...', 'This usually takes 5-10 seconds');

    try {
        // Try demo mode first (pre-baked results for instant experience)
        if (!STATE.geminiKey || useDemo) {
            await runDemoMode();
            return;
        }

        if (STATE.mode === 'court') {
            await runCourtMode();
        } else {
            await runHealthMode();
        }
    } catch (err) {
        console.error(err);
        // Fallback to demo on error
        console.log('Falling back to demo mode...');
        await runDemoMode();
    }
}

async function runDemoMode() {
    setLoading('Loading demo results...', 'Pre-generated with AI');
    await new Promise(r => setTimeout(r, 1500)); // Simulate loading

    const mode = STATE.mode === 'behavior' ? 'health' : STATE.mode; // behavior uses health demo
    const demoFiles = DEMO_DATA[mode] || DEMO_DATA.health;

    try {
        const resp = await fetch(demoFiles.json);
        const result = await resp.json();

        let audioBlob = null;
        try {
            const audioResp = await fetch(demoFiles.audio);
            audioBlob = await audioResp.blob();
        } catch(e) { /* audio optional */ }

        if (mode === 'court') {
            displayCourtResults(result, audioBlob);
        } else {
            displayResults(result, audioBlob);
        }
    } catch(e) {
        alert('Demo files not found. Please provide API keys for live analysis.');
        showSection('ws-input');
    }
}

// ============================================================
// HEALTH / BEHAVIOR / EMERGENCY MODE
// ============================================================

async function runHealthMode() {
    const dogInfo = getDogProfile();
    const situation = document.getElementById('situation-input')?.value.trim() || '';
    const prompt = buildPrompt(STATE.mode, dogInfo, situation);

    setLoading('AI is examining the photo...', 'Looking at body condition, posture, coat, eyes...');

    const result = await callGemini(prompt, STATE.imageBase64 ? true : false);

    // Generate voice (if ElevenLabs key available)
    let audioBlob = null;
    if (STATE.elevenLabsKey && result.voice_summary) {
        setLoading('Generating voice summary...', 'Almost done');
        audioBlob = await generateVoice(result.voice_summary);
    }

    displayResults(result, audioBlob);
}

function buildPrompt(mode, dogInfo, situation) {
    const dogContext = dogInfo.breed || dogInfo.age || dogInfo.weight || dogInfo.name
        ? `\nDog details: ${dogInfo.name ? 'Name: ' + dogInfo.name + '. ' : ''}${dogInfo.breed ? 'Breed: ' + dogInfo.breed + '. ' : ''}${dogInfo.age ? 'Age: ' + dogInfo.age + '. ' : ''}${dogInfo.weight ? 'Weight: ' + dogInfo.weight + '.' : ''}`
        : '';

    const situationContext = situation ? `\nOwner's description: "${situation}"` : '';

    if (mode === 'health') {
        return `You are PawWise, a friendly AI veterinary advisor. Analyze this photo of a dog.${dogContext}${situationContext}

Provide a comprehensive health assessment in this JSON format:
{
    "urgency": "green" | "yellow" | "orange" | "red",
    "urgency_label": "one-line summary of overall status",
    "body_condition": {
        "score": "estimated BCS on 1-9 scale (5 is ideal)",
        "assessment": "underweight/ideal/overweight/obese",
        "details": "what you observe about weight"
    },
    "observations": [
        {"area": "Coat", "status": "good/concern/unknown", "note": "what you see"},
        {"area": "Eyes", "status": "good/concern/unknown", "note": "what you see"},
        {"area": "Posture", "status": "good/concern/unknown", "note": "what you see"},
        {"area": "Energy", "status": "good/concern/unknown", "note": "any visible indicators"}
    ],
    "breed_risks": ["list of health conditions common in this breed to watch for"],
    "action_items": ["specific things the owner should do or watch for"],
    "voice_summary": "A warm, conversational 2-3 sentence summary to be spoken aloud. Start with 'Hey there!' Be reassuring but honest."
}

Be specific about what you SEE. If you can't assess something from the photo, say so honestly. Always remind that this is not a substitute for vet care.`;
    }

    if (mode === 'behavior') {
        return `You are PawWise, a friendly dog behavior expert. A dog owner needs help understanding their dog's behavior.${dogContext}${situationContext}

${STATE.imageBase64 ? 'Analyze the photo for behavioral context.' : ''}

Provide a behavioral assessment in this JSON format:
{
    "urgency": "green" | "yellow" | "orange" | "red",
    "urgency_label": "one-line summary",
    "behavior_explanation": "Why the dog is likely doing this (2-3 sentences, plain language)",
    "is_normal": true/false,
    "breed_context": "How this behavior relates to the breed's instincts/needs",
    "possible_causes": ["list of likely causes ranked by probability"],
    "what_to_do": ["specific, actionable training/management steps"],
    "when_to_worry": "describe when this behavior becomes concerning enough for a vet/behaviorist",
    "voice_summary": "Warm 2-3 sentence spoken summary. Validate the owner's concern, explain simply, give one tip."
}

Be practical and specific. No jargon. Explain WHY the dog does this, not just what to do.`;
    }

    if (mode === 'emergency') {
        return `You are PawWise Emergency Triage. A dog owner is worried about their dog.${dogContext}${situationContext}

${STATE.imageBase64 ? 'Analyze the photo for clinical signs.' : ''}

Provide emergency triage in this JSON format:
{
    "urgency": "green" | "yellow" | "orange" | "red",
    "urgency_label": "Clear one-line verdict (e.g., 'This is not an emergency, but see your vet this week')",
    "assessment": "2-3 sentence explanation of what's likely happening",
    "immediate_actions": ["what to do RIGHT NOW, step by step"],
    "watch_for": ["signs that indicate it's getting WORSE and they should go to emergency vet"],
    "vet_questions": ["questions the vet will ask — prepare these answers"],
    "timeframe": "how urgently they need to act (e.g., 'within 2 hours' or 'schedule within a week')",
    "voice_summary": "Calm, reassuring 2-3 sentence spoken summary. Be clear about urgency without causing panic."
}

CRITICAL: Err on the side of caution for anything potentially life-threatening (GDV/bloat, toxin ingestion, seizures, breathing difficulty). Better to say "go to vet" than miss something serious.
Always include: "If you're ever unsure, calling your vet is always the right choice."`;
    }
}

function getDogProfile() {
    return {
        breed: document.getElementById('dog-breed')?.value.trim() || '',
        age: document.getElementById('dog-age')?.value.trim() || '',
        weight: document.getElementById('dog-weight')?.value.trim() || '',
        name: document.getElementById('dog-name')?.value.trim() || '',
    };
}

// ============================================================
// DOG COURT MODE
// ============================================================

async function runCourtMode() {
    setLoading('Analyzing the crime scene...', 'Gathering evidence');

    // Step 1: Analyze crime
    const analysisPrompt = `You are a forensic investigator for DOG COURT. Analyze this image of a dog's "crime scene."
Identify what the dog did, the evidence, the breed, and suggest a funny defendant name.
Respond in JSON: {"crime": "...", "evidence": ["..."], "dog_breed": "...", "dog_name": "...", "severity": "misdemeanor|felony"}
Be funny and dramatic.`;

    const analysis = await callGemini(analysisPrompt, true);

    // Step 2: Generate script
    setLoading('Writing courtroom script...', 'Assembling legal team');

    const scriptPrompt = `You write comedy for DOG COURT. Based on this crime: ${JSON.stringify(analysis)}
Write a courtroom script. Characters: JUDGE (dry humor), DEFENSE (theatrical, absurd legal arguments), PROSECUTION (exasperated human), DEFENDANT (confused dog).
JSON format:
{
    "case_title": "The People vs. [Name]",
    "charge": "formal humorous charge",
    "dialogue": [{"speaker": "judge|defense|prosecution|defendant", "emotion": "tag", "line": "text under 200 chars"}],
    "verdict": "NOT GUILTY",
    "verdict_reason": "humorous reason"
}
6-8 lines total. Under 1800 chars total for all dialogue. Be genuinely funny!`;

    const script = await callGemini(scriptPrompt, false);

    // Step 3: Generate audio (if ElevenLabs key)
    let audioBlob = null;
    if (STATE.elevenLabsKey && script.dialogue) {
        setLoading('Voice-acting the trial...', 'Multiple characters speaking');
        const inputs = script.dialogue.map(line => ({
            text: line.emotion ? `[${line.emotion}] ${line.line}` : line.line,
            voice_id: VOICES[line.speaker] || VOICES.judge
        }));

        try {
            audioBlob = await callElevenLabsDialogue(inputs);
        } catch (e) {
            console.warn('Audio generation failed, showing text only:', e);
        }
    }

    displayCourtResults(script, audioBlob);
}

// ============================================================
// API CALLS
// ============================================================

async function callGemini(prompt, includeImage) {
    const parts = [{ text: prompt }];

    if (includeImage && STATE.imageBase64) {
        parts.push({
            inline_data: {
                mime_type: STATE.imageFile?.type || 'image/jpeg',
                data: STATE.imageBase64
            }
        });
    }

    const requestBody = {
        contents: [{ parts }],
        generationConfig: { temperature: 0.8, responseMimeType: 'application/json' }
    };

    // Route to proxy in dev mode, Gemini in production
    let url;
    if (DEV_MODE) {
        url = PROXY_URL;
    } else {
        url = `${GEMINI_URL}?key=${STATE.geminiKey}`;
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini API error (${res.status})`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return JSON.parse(text);
}

async function generateVoice(text) {
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + VOICES.narrator, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': STATE.elevenLabsKey,
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
        })
    });

    if (!res.ok) throw new Error('ElevenLabs TTS failed');
    return await res.blob();
}

async function callElevenLabsDialogue(inputs) {
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-dialogue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': STATE.elevenLabsKey,
        },
        body: JSON.stringify({ inputs })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`ElevenLabs dialogue failed: ${err}`);
    }
    return await res.blob();
}

// ============================================================
// DISPLAY RESULTS
// ============================================================

function displayResults(result, audioBlob) {
    // Urgency banner
    const banner = document.getElementById('urgency');
    banner.className = `urgency ${result.urgency}`;
    banner.classList.remove('hidden');
    document.getElementById('urgency-text').textContent = result.urgency_label || 'Assessment complete';

    // Voice player
    if (audioBlob) {
        setupAudio(audioBlob);
        document.getElementById('voice-card').classList.remove('hidden');
    } else {
        document.getElementById('voice-card').classList.add('hidden');
    }

    // Build report HTML
    const report = document.getElementById('report');
    report.innerHTML = buildReportHTML(result);

    // Hide court section
    document.getElementById('court').classList.add('hidden');
    report.classList.remove('hidden');

    showSection('ws-results');
}

function buildReportHTML(result) {
    let html = '';

    // Body condition (health mode)
    if (result.body_condition) {
        html += `<div class="report-section">
            <h4>Body Condition</h4>
            <p><strong>Score: ${result.body_condition.score}/9</strong> (${result.body_condition.assessment})</p>
            <p>${result.body_condition.details}</p>
        </div>`;
    }

    // Observations
    if (result.observations) {
        html += `<div class="report-section"><h4>Observations</h4><ul>`;
        result.observations.forEach(obs => {
            const statusIcon = obs.status === 'good' ? '✅' : obs.status === 'concern' ? '⚠️' : '❓';
            html += `<li>${statusIcon} <strong>${obs.area}:</strong> ${obs.note}</li>`;
        });
        html += `</ul></div>`;
    }

    // Behavior explanation
    if (result.behavior_explanation) {
        html += `<div class="report-section">
            <h4>What's Happening</h4>
            <p>${result.behavior_explanation}</p>
        </div>`;
    }

    // Assessment (emergency)
    if (result.assessment && STATE.mode === 'emergency') {
        html += `<div class="report-section">
            <h4>Assessment</h4>
            <p>${result.assessment}</p>
        </div>`;
    }

    // Immediate actions
    if (result.immediate_actions) {
        html += `<div class="report-section"><h4>Do This Now</h4><ul>`;
        result.immediate_actions.forEach(a => { html += `<li>${a}</li>`; });
        html += `</ul></div>`;
    }

    // What to do
    if (result.what_to_do) {
        html += `<div class="report-section"><h4>What To Do</h4><ul>`;
        result.what_to_do.forEach(a => { html += `<li>${a}</li>`; });
        html += `</ul></div>`;
    }

    // Possible causes
    if (result.possible_causes) {
        html += `<div class="report-section"><h4>Possible Causes</h4><ul>`;
        result.possible_causes.forEach(c => { html += `<li>${c}</li>`; });
        html += `</ul></div>`;
    }

    // Breed risks
    if (result.breed_risks && result.breed_risks.length > 0) {
        html += `<div class="report-section"><h4>Breed-Specific Risks to Watch</h4><ul>`;
        result.breed_risks.forEach(r => { html += `<li>${r}</li>`; });
        html += `</ul></div>`;
    }

    // Watch for (emergency)
    if (result.watch_for) {
        html += `<div class="report-section"><h4>⚠️ Go to Emergency Vet If...</h4><ul>`;
        result.watch_for.forEach(w => { html += `<li>${w}</li>`; });
        html += `</ul></div>`;
    }

    // Action items
    if (result.action_items) {
        html += `<div class="report-section"><h4>Action Items</h4><ul>`;
        result.action_items.forEach(a => { html += `<li>${a}</li>`; });
        html += `</ul></div>`;
    }

    // Vet questions
    if (result.vet_questions) {
        html += `<div class="report-section"><h4>Questions Your Vet Will Ask</h4><ul>`;
        result.vet_questions.forEach(q => { html += `<li>${q}</li>`; });
        html += `</ul></div>`;
    }

    // Disclaimer
    html += `<div class="report-section">
        <p style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
            ⚠️ PawWise is an AI tool, not a veterinarian. When in doubt, always consult your vet.
        </p>
    </div>`;

    return html;
}

function displayCourtResults(script, audioBlob) {
    // Hide regular report, show court
    document.getElementById('report').classList.add('hidden');
    document.getElementById('urgency').classList.add('hidden');
    document.getElementById('voice-card').classList.add('hidden');

    const courtSection = document.getElementById('court');
    courtSection.classList.remove('hidden');

    document.getElementById('court-case-title').textContent = script.case_title || 'The People vs. Dog';
    document.getElementById('court-charge').textContent = `Charge: ${script.charge || 'Being too cute'}`;

    // Transcript
    const transcript = document.getElementById('court-transcript');
    const icons = { judge: '🧑‍⚖️', defense: '🦮', prosecution: '👤', defendant: '🐕' };
    const names = { judge: 'Judge', defense: 'Defense', prosecution: 'Prosecution', defendant: 'Defendant' };

    transcript.innerHTML = script.dialogue.map(line => `
        <div class="court-line">
            <span class="speaker">${icons[line.speaker] || '👤'} ${names[line.speaker] || line.speaker}</span>
            <span class="dialog">${line.line}</span>
        </div>
    `).join('');

    // Verdict
    const verdictEl = document.getElementById('court-verdict');
    verdictEl.className = 'court-verdict' + (script.verdict === 'GUILTY' ? ' guilty' : '');
    verdictEl.innerHTML = `
        <span class="verdict-text">${script.verdict}</span>
        <span class="verdict-reason">${script.verdict_reason}</span>
    `;

    // Audio
    const playBtn = document.getElementById('btn-play-court');
    if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        playBtn.onclick = () => {
            if (audio.paused) { audio.play(); playBtn.textContent = '⏸ Playing...'; }
            else { audio.pause(); playBtn.textContent = '▶ Play Trial'; }
        };
        audio.onended = () => { playBtn.textContent = '▶ Play Again'; };
        playBtn.classList.remove('hidden');
    } else {
        playBtn.classList.add('hidden');
    }

    showSection('ws-results');
}

// ============================================================
// AUDIO PLAYBACK
// ============================================================

function setupAudio(blob) {
    if (STATE.audioElement) { STATE.audioElement.pause(); }
    const url = URL.createObjectURL(blob);
    STATE.audioElement = new Audio(url);
    STATE.audioElement.addEventListener('timeupdate', () => {
        const pct = (STATE.audioElement.currentTime / STATE.audioElement.duration) * 100;
        document.getElementById('voice-progress').style.width = pct + '%';
    });
    STATE.audioElement.addEventListener('ended', () => {
        STATE.isPlaying = false;
        document.getElementById('btn-play').textContent = '▶';
    });
}

function toggleAudio() {
    if (!STATE.audioElement) return;
    if (STATE.isPlaying) {
        STATE.audioElement.pause();
        document.getElementById('btn-play').textContent = '▶';
    } else {
        STATE.audioElement.play();
        document.getElementById('btn-play').textContent = '⏸';
    }
    STATE.isPlaying = !STATE.isPlaying;
}

// ============================================================
// UTILITIES
// ============================================================

function setLoading(text, sub) {
    document.getElementById('loading-title').textContent = text;
    document.getElementById('loading-sub').textContent = sub;
}

function share() {
    const text = `🐾 Just used PawWise — an AI vet friend that checks your dog's health from a photo!\n\nTry it: ${window.location.href}`;
    if (navigator.share) navigator.share({ text });
    else {
        navigator.clipboard.writeText(text);
        alert('Link copied!');
    }
}
