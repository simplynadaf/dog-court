# 🏛️ DOG COURT — Your Dog Pleads Their Case

> Every dog deserves their day in court.

Upload a photo of your dog's "crime" and watch as AI generates a full courtroom drama — complete with a judge, defense attorney, prosecution, and voice-acted trial.

![DOG COURT Screenshot](screenshots/demo.png)

## 🎯 What It Does

1. **Upload** a photo of your dog's crime scene (chewed shoes, destroyed pillows, stolen food...)
2. **Google Gemini** analyzes the evidence and writes a hilarious courtroom script
3. **ElevenLabs Text-to-Dialogue** voices multiple characters in a single dramatic audio
4. **Listen** to the full trial and discover the verdict

## 🎙️ Characters

| Character | Role |
|-----------|------|
| 🧑‍⚖️ **Judge Barksworth** | Stern, world-weary, dry humor |
| 🦮 **Defense Attorney Rex** | Theatrical, uses absurd legal precedents |
| 👤 **The Prosecution** | Exasperated human owner |
| 🐕 **The Defendant** | Confused but endearing |

## 🛠️ Tech Stack

- **Google AI (Gemini 2.0 Flash)** — Multimodal image analysis + structured script generation
- **ElevenLabs Text-to-Dialogue API** — Multi-voice courtroom drama in a single audio
- **Vanilla HTML/CSS/JS** — No framework, just clean code

## 🚀 Try It

### Live Demo
[→ dog-court.vercel.app](https://dog-court.vercel.app) *(coming soon)*

### Run Locally
```bash
# Clone
git clone https://github.com/SimplyNadaf/dog-court.git
cd dog-court

# Serve (any static server works)
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` and enter your API keys.

### Get API Keys (Free)
- **Google AI Studio**: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **ElevenLabs**: [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)

## 📁 Project Structure

```
dog-court/
├── index.html      # Courtroom UI
├── style.css       # Mahogany & gold courthouse theme
├── app.js          # API orchestration + audio playback
├── audio/          # Pre-generated sample trials
└── screenshots/    # Demo screenshots
```

## 🏆 Prize Categories

- ✅ **Best Use of Google AI** — Gemini multimodal image analysis + JSON structured output
- ✅ **Best Use of ElevenLabs** — Text-to-Dialogue API for multi-character voice drama

## 📝 How It Works

### 1. Crime Scene Analysis (Gemini Vision)
```
Photo → Gemini 2.0 Flash → {crime, evidence, breed, severity}
```

### 2. Script Generation (Gemini Text)
```
Crime analysis → Gemini → Structured courtroom script (JSON)
```

### 3. Voice Acting (ElevenLabs Text-to-Dialogue)
```
Script → Multiple voice_ids + emotion tags → Single audio output
```

## 🎬 Sample Verdicts

> **Case #472: The People vs. Muffin**
> Charge: Destruction of Property in the First Degree
> Verdict: NOT GUILTY — by reason of extreme cuteness and insufficient morning walks

> **Case #891: The People vs. Sir Barks-a-Lot**
> Charge: Grand Theft Sandwich
> Verdict: NOT GUILTY — food left unattended for 3+ seconds constitutes abandonment under the Finders Keepers Act of 2019

## 📄 License

MIT — Built for [DEV Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13)

---

Built with ❤️ and a chewed-up throw pillow by [Sarvar Nadaf](https://dev.to/simplynadaf)
