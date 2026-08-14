---
title: "59% of Dogs Are Obese and Their Owners Don't Know. So I Built an AI That Tells Them."
published: false
tags: devchallenge, weekendchallenge, ai, showdev
description: "PawWise uses Google AI to analyze your dog's health from a photo, decode confusing behavior, triage emergencies, and (when things are fine) put your dog on trial for their crimes."
cover_image: 
---

*This is a submission for [Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13)*

## What I Built

Three months after adopting my rescue, I noticed he was sleeping more and eating slower. I thought he was "settling in." Six months later, the vet told me he had Stage 3 arthritis. Completely treatable if caught early.

I'm not alone. 60% of serious health issues in dogs are discovered after symptoms become severe. Owners spend $653 on average at emergency vets for things that were either totally normal or should have been caught weeks earlier. And 59% of dogs in the US are overweight without their owners realizing.

**PawWise** is an AI vet friend that gives dog owners what they actually need: instant clarity.

Upload a photo of your dog and get:

- **Health Check**: Body condition score, coat health, posture analysis, breed-specific risks
- **Behavior Decoder**: "Why is my dog doing this?" with breed context and training steps
- **Emergency Triage**: Is this an emergency? Green/Yellow/Orange/Red urgency with first aid
- **Dog Court** (fun mode): Your healthy dog committed a crime? AI generates a voice-acted courtroom drama

The serious modes solve real problems. The fun mode gives you something to share when everything is fine.

---

## Demo

{% embed https://simplynadaf.github.io/dog-court %}

**Try it live:** [simplynadaf.github.io/dog-court](https://simplynadaf.github.io/dog-court)

Upload any photo of your dog. The AI will analyze it and give you a full health report with actionable next steps, spoken aloud in a calm voice.

In Dog Court mode, upload evidence of your dog's "crime" (chewed shoes, stolen food, destroyed pillows) and listen to a full multi-voice courtroom drama where your dog gets legal representation.

---

## Code

{% github SimplyNadaf/dog-court %}

---

## How I Built It

### The Research That Shaped Everything

Before writing a single line of code, I spent time looking at the actual data:

| Problem | Scale |
|---------|-------|
| Dogs overweight/obese | 59-65% in the US (ASPCA, Cornell) |
| Health issues caught too late | 60% (AVMA) |
| Owners can't spot subtle pain | Same accuracy as non-owners (2026 PLOS ONE) |
| Average emergency vet visit | $653, often unnecessary |
| Dogs surrendered to shelters | 28% due to behavior owners didn't understand |

The pattern was clear: owners love their dogs but lack the knowledge to interpret what they're seeing. A tool that bridges that gap could genuinely save lives.

---

### Architecture

```
Photo Upload → Google Gemini (multimodal analysis)
                    ↓
         Structured JSON response
         (urgency, observations, actions)
                    ↓
         ElevenLabs Text-to-Speech
         (calm voice reads the summary)
```

For Dog Court mode, the pipeline extends:

```
Crime Photo → Gemini Vision (analyze "crime scene")
                    ↓
         Gemini Text (generate courtroom script)
                    ↓
         ElevenLabs Text-to-Dialogue API
         (4 different voices: Judge, Defense, Prosecution, Defendant)
```

---

### Technical Decisions

**Google Gemini 2.0 Flash** for all AI analysis. Multimodal (understands images natively), supports structured JSON output (no parsing errors), and the free tier is generous enough for a real app. I use the `responseMimeType: 'application/json'` parameter to guarantee structured responses.

**ElevenLabs Text-to-Dialogue API** is the secret weapon for Dog Court. One API call, multiple voice IDs, one cohesive audio output. Each character gets their own voice and emotion tags like `[dramatically]` or `[innocently]`. The result sounds like a produced audio drama, not stitched TTS clips.

**Zero dependencies.** The entire app is vanilla HTML, CSS, and JavaScript. No React, no build tools, no npm install. Loads instantly and deploys anywhere. I wanted the barrier to trying it to be as low as possible.

**API keys stay in the browser.** LocalStorage only. No backend server, no data collection. Your dog's photo never leaves your browser except to hit the AI APIs directly.

---

### The Prompt Engineering

The health check prompt asks Gemini to assess specific clinical indicators:

```
Assess:
1. Body Condition Score (1-9 scale)
2. Coat condition (shiny/dull/patchy)
3. Eye condition (clear/discharge/redness)
4. Posture (normal/hunched/favoring a leg)
5. Breed-specific risks to watch for

Respond with urgency level: green/yellow/orange/red
```

For Emergency Triage, the key instruction is: "Err on the side of caution. Better to say go to vet than miss something serious." Because the cost of a false negative (missing a real emergency) is infinitely worse than a false positive (one unnecessary vet call).

Dog Court prompts are pure comedy writing. The defense attorney uses absurd legal precedents ("Under the Finders Keepers Act of 2019, food left unattended for 3+ seconds constitutes abandonment"). The judge delivers dry one-liners. The defendant just says "Woof?"

---

### What I Learned

1. **ElevenLabs' Text-to-Dialogue API is underrated.** Most people use their basic TTS. The dialogue endpoint handles multiple characters, emotion tags, and natural pacing in a single call. Perfect for conversational AI output.

2. **Gemini's structured output eliminates parsing bugs.** Setting `responseMimeType: 'application/json'` with a defined schema means the model always returns valid, predictable JSON. No more regex extraction from free-text.

3. **The line between useful and fun is where the best products live.** PawWise could have been just a health tool (boring) or just Dog Court (shallow). Combining both makes it something people actually want to open again.

---

## Prize Categories

**Best Use of Google AI**: Gemini powers all 4 modes. Multimodal image analysis for health checks and crime scene analysis. Structured JSON output for reliable, parseable responses. The AI doesn't just describe what it sees. It triages, recommends, and contextualizes based on breed-specific veterinary knowledge.

**Best Use of ElevenLabs**: Two distinct integrations. Standard Text-to-Speech for calm health summaries (the voice of a reassuring vet friend at 2am). Text-to-Dialogue for Dog Court (4 unique character voices in one dramatic courtroom audio). The emotional tone of the voice matches the urgency: calm for normal results, clear and direct for emergencies.

---

*The vet disclaimer: PawWise is an AI tool, not a veterinarian. When in doubt, always see your vet. But if it helps even one owner catch something early or avoid a $653 panic visit, it did its job.*
