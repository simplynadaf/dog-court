<div align="center">

# 🐾 PawWise

### AI That Actually Understands Your Dog

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=github)](https://simplynadaf.github.io/dog-court)
[![YouTube](https://img.shields.io/badge/Watch-Demo-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=vqyF_65Qc_s)
[![Dev.to](https://img.shields.io/badge/Read-Article-0A0A0A?style=for-the-badge&logo=devdotto)](https://dev.to/sarvar_04/59-of-dogs-are-obese-and-their-owners-dont-know-so-i-built-an-ai-that-tells-them-2a89)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

<img src="img/banner.png" alt="PawWise - AI Vet Friend" width="100%"/>

<br/>

**59% of dogs are obese and their owners don't know.**<br/>
**60% of serious health issues are caught too late.**<br/>
I built an AI that catches it in a photo.

<br/>

[Live Site →](https://simplynadaf.github.io/dog-court) &nbsp;|&nbsp; [Watch Demo →](https://www.youtube.com/watch?v=vqyF_65Qc_s) &nbsp;|&nbsp; [Read Article →](https://dev.to/sarvar_04/59-of-dogs-are-obese-and-their-owners-dont-know-so-i-built-an-ai-that-tells-them-2a89)

</div>

---

## 🎬 Demo

<div align="center">

[![PawWise Demo](https://img.youtube.com/vi/vqyF_65Qc_s/maxresdefault.jpg)](https://www.youtube.com/watch?v=vqyF_65Qc_s)

*Click to watch the full demo on YouTube*

</div>

---

## 🎯 4 Modes, 1 Goal: Keep Your Dog Healthy

| Mode | What Happens |
|------|-------------|
| 🏥 **Health Check** | Upload a photo → AI assesses body condition score, coat health, posture, eyes, and flags breed-specific risks |
| 🧠 **Behavior Decoder** | "Why is my dog doing this?" → Breed-specific explanations, whether it's normal, and what to do |
| 🚨 **Emergency Triage** | "My dog ate chocolate" → 🟢🟡🟠🔴 urgency level + first aid + when to rush to the vet |
| ⚖️ **Dog Court** | Upload evidence of destroyed shoes → AI generates a full multi-voice courtroom drama |

---

## ✨ Key Features

- 🖼️ **Multimodal AI** - Upload any dog photo, AI understands what it sees
- 🎯 **Structured Reports** - Body condition score, observations, action items (not generic AI rambling)
- 🔊 **Voice Summaries** - Calm spoken summary when you need reassurance at 2am
- 🎭 **Multi-Voice Court Drama** - 4 unique characters: Judge, Defense, Prosecution, Defendant
- 🚦 **Color-Coded Urgency** - Green/Yellow/Orange/Red so you know instantly how serious it is
- 🐕 **Breed-Aware** - Enter your dog's breed for context-specific health risks
- 🔒 **100% Client-Side** - No backend, no data collection, keys stay in your browser
- ⚡ **Zero Dependencies** - 3 files. No npm. No build step. Instant load.

---

## 📊 The Problem (Real Data)

| Crisis | Scale |
|--------|-------|
| Dogs overweight/obese | 59-65% in the US |
| Health issues caught too late | 60% (AVMA) |
| Owners can't spot pain | Same accuracy as non-owners (2026 study) |
| Emergency vet panic visits | $653 average, often unnecessary |
| Dogs surrendered to shelters | 28% due to behavior misunderstanding |
| Dogs killed in shelters annually | 359,000+ (2023 peak) |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Vanilla HTML/CSS/JS | Zero dependencies, instant load, deploys anywhere |
| AI Engine | Google Gemini 3.5 Flash | Multimodal vision, structured JSON output, free tier |
| Voice | ElevenLabs TTS + Dialogue | Natural voice summaries + multi-character drama |
| Hosting | GitHub Pages | Free, auto-deploy on push |

---

## 🚀 Quick Start

```bash
git clone https://github.com/SimplyNadaf/dog-court.git
cd dog-court
npx serve .
```

Open `http://localhost:3000` → Click 🔑 Keys → Enter your API keys → Upload a dog photo.

### API Keys (Free, 30 seconds)

| Service | Get Key | Required |
|---------|---------|----------|
| Google AI (Gemini) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ✅ Yes |
| ElevenLabs | [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys) | Optional (for voice) |

---

## 🔬 Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Dog Photo  │────▶│  Google Gemini   │────▶│  Structured     │
│  + Context  │     │  3.5 Flash       │     │  JSON Report    │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │  ElevenLabs     │
                                             │  TTS/Dialogue   │
                                             └────────┬────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │  Voice Summary  │
                                             │  or Court Drama │
                                             └─────────────────┘
```

**Dog Court extends the pipeline:**

Photo → Gemini (analyze crime) → Gemini (write script) → ElevenLabs Dialogue (4 voices) → Audio drama

---

## 🔒 Privacy

- No backend server. Everything runs in your browser.
- API keys stored in localStorage only. Never transmitted to us.
- Dog photos sent directly to Google/ElevenLabs APIs. We never see them.
- No analytics. No tracking. No cookies.

---

## 🏆 Built For

**[DEV Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13)**

| Category | How |
|----------|-----|
| **Best Use of Google AI** | Gemini multimodal vision + structured JSON for health triage across 4 modes |
| **Best Use of ElevenLabs** | TTS for voice summaries + Text-to-Dialogue for multi-character court drama |

---

## 📁 Project Structure

```
dog-court/
├── index.html            # Single-page app (13KB)
├── style.css             # Premium UI - warm cream, glass nav, spring animations (24KB)
├── app.js                # Gemini + ElevenLabs integration (29KB)
├── img/
│   ├── banner.png        # README banner
│   ├── hero.png          # Hero section
│   └── icon-*.png        # Mode icons (health, behavior, emergency, court)
└── .github/workflows/
    └── deploy.yml        # Auto-deploy to GitHub Pages on push
```

---

## 🤝 Contributing

Contributions welcome! Some ideas:

- [ ] Add more dog breeds to the health risk database
- [ ] Support cat health checks
- [ ] Add multiple language support
- [ ] Offline mode with cached results
- [ ] Dark mode

Fork it, improve it, PR it.

---

## ⚠️ Disclaimer

PawWise is an AI tool, not a veterinarian. It helps you make better decisions about your dog's health - it does not replace professional veterinary care. When in doubt, always see your vet.

---

## Author

**Sarvar Nadaf** - Cloud Architect | 10+ yrs Cloud & IT | 7x AWS Certified | AWS Community Builder

| Platform | Link |
|----------|------|
| 🌐 Portfolio | [sarvarnadaf.com](https://sarvarnadaf.com) |
| 💼 LinkedIn | [linkedin.com/in/sarvar04](https://www.linkedin.com/in/sarvar04/) |
| ✍️ Dev.to | [dev.to/sarvar_04](https://dev.to/sarvar_04) |
| 🎥 YouTube | [youtube.com/@Sarvar-Nadaf](https://www.youtube.com/@Sarvar-Nadaf) |
| 🐦 X/Twitter | [x.com/SarvarN_04](https://x.com/SarvarN_04) |
| ☁️ AWS Builder | [builder.aws.com/community/@sarvar](https://builder.aws.com/community/@sarvar) |
| 📧 Email | [simplynadaf@gmail.com](mailto:simplynadaf@gmail.com) |

---

## 📄 License

MIT

---

<div align="center">

**Because no dog should suffer in silence while their owner thinks everything is fine.**

⭐ Star this repo if it helped you!

[![Star this repo](https://img.shields.io/github/stars/simplynadaf/dog-court?style=social)](https://github.com/simplynadaf/dog-court)

</div>
