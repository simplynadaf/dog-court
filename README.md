# 🐾 PawWise — Your AI Vet Friend

> 59% of dogs are obese and their owners don't know. 60% of serious health issues are caught too late. I built an AI that catches it in a photo.

Upload a photo of your dog — get instant health checks, behavior explanations, emergency triage, and (when your dog is healthy) a courtroom drama about their latest crime.

## 🎯 What It Does

### 🏥 Health Check
Upload a photo → AI assesses body condition score, coat health, posture, eyes, and flags breed-specific risks. Catches the subtle signs that 60% of owners miss.

### 🧠 Behavior Decoder  
"Why is my dog doing this?" → Breed-specific explanations, whether it's normal, what's causing it, and what to do. Prevents the misunderstanding → frustration → shelter surrender cycle.

### 🚨 Emergency Triage
"My dog ate chocolate" or "limping since yesterday" → Green/Yellow/Orange/Red urgency + first aid steps + when to rush to the vet. Saves $653 panic visits AND catches real emergencies.

### 🏛️ Dog Court (Fun Mode)
Your dog is healthy? Put them on trial for their crimes! Upload evidence of destroyed shoes → AI generates a full multi-voice courtroom drama.

## 📊 The Problem (Real Data)

| Crisis | Scale |
|--------|-------|
| Dogs overweight/obese | 59-65% in the US |
| Health issues caught too late | 60% (AVMA) |
| Owners can't spot pain | Same accuracy as non-owners (2026 study) |
| Separation anxiety | 17-29% clinical prevalence |
| Emergency vet panic visits | $653 average, often unnecessary |
| Dogs surrendered to shelters | 28% due to behavior misunderstanding |
| Dogs killed in shelters annually | 359,000+ (2023 peak) |

## 🛠️ Tech Stack

- **Google AI (Gemini 2.0 Flash)** — Multimodal image analysis, structured JSON output, breed-aware health assessment
- **ElevenLabs** — Voice summaries (Text-to-Speech) + multi-character courtroom drama (Text-to-Dialogue API)
- **Vanilla HTML/CSS/JS** — Zero dependencies, instant load, works everywhere

## 🚀 Try It

**Live:** [simplynadaf.github.io/dog-court](https://simplynadaf.github.io/dog-court)

**Local:**
```bash
git clone https://github.com/SimplyNadaf/dog-court.git
cd dog-court
npx serve .
```

### API Keys (Free)
- **Google AI Studio**: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **ElevenLabs** (optional, for voice): [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)

## 🏆 Prize Categories

- ✅ **Best Use of Google AI** — Gemini multimodal image analysis + structured output for health triage
- ✅ **Best Use of ElevenLabs** — Voice health summaries + Text-to-Dialogue courtroom drama

## 🔬 How It Works

```
┌──────────────────────────────────────────────────┐
│ User uploads photo + selects mode                │
├──────────────────────────────────────────────────┤
│                                                  │
│  Health Mode:                                    │
│  Photo → Gemini Vision → Body condition,         │
│  coat, posture, breed risks → Voice summary      │
│                                                  │
│  Emergency Mode:                                 │
│  Description + Photo → Gemini Triage →           │
│  🟢🟡🟠🔴 Urgency + First aid + When to go      │
│                                                  │
│  Dog Court Mode:                                 │
│  Crime photo → Gemini script → ElevenLabs        │
│  Text-to-Dialogue → Multi-voice trial audio      │
│                                                  │
└──────────────────────────────────────────────────┘
```

## ⚠️ Disclaimer

PawWise is an AI tool, not a veterinarian. It's designed to help you make better decisions about your dog's health — not replace professional veterinary care. When in doubt, always see your vet.

## 📄 License

MIT — Built for [DEV Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13)

---

Built with ❤️ by [Sarvar Nadaf](https://dev.to/simplynadaf) — because no dog should suffer in silence while their owner thinks everything is fine.
