#!/usr/bin/env python3
"""
PawWise — Test with Amazon Bedrock Nova Pro
Tests all modes: Health Check, Behavior, Emergency, Dog Court
"""

import boto3
import json
import base64
import sys
import os

# Setup Bedrock client
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
MODEL_ID = 'amazon.nova-pro-v1:0'

def call_nova(prompt, image_path=None):
    """Call Nova Pro with text and optional image."""
    content = []
    
    if image_path and os.path.exists(image_path):
        with open(image_path, 'rb') as f:
            img_bytes = f.read()
        
        # Determine media type
        ext = image_path.lower().split('.')[-1]
        media_type = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}.get(ext, 'image/jpeg')
        
        img_b64 = base64.b64encode(img_bytes).decode('utf-8')
        content.append({
            "image": {
                "format": ext if ext in ['jpeg', 'png', 'webp', 'gif'] else 'jpeg',
                "source": {"bytes": img_b64}
            }
        })
    
    content.append({"text": prompt})
    
    body = {
        "messages": [{"role": "user", "content": content}],
        "inferenceConfig": {
            "temperature": 0.8,
            "maxTokens": 2000
        }
    }
    
    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType='application/json',
        accept='application/json',
        body=json.dumps(body)
    )
    
    result = json.loads(response['body'].read())
    text = result['output']['message']['content'][0]['text']
    
    # Try to parse as JSON (strip markdown code fences if present)
    text = text.strip()
    if text.startswith('```json'):
        text = text[7:]
    if text.startswith('```'):
        text = text[3:]
    if text.endswith('```'):
        text = text[:-3]
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw_text": text}


def test_health_check(image_path):
    """Test Health Check mode."""
    print("\n" + "="*60)
    print("🏥 HEALTH CHECK MODE")
    print("="*60)
    
    prompt = """You are PawWise, a friendly AI veterinary advisor. Analyze this photo of a dog.

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

Be specific about what you SEE. If you can't assess something from the photo, say so. Always remind this is not a substitute for vet care."""

    result = call_nova(prompt, image_path)
    print(json.dumps(result, indent=2))
    return result


def test_emergency_triage():
    """Test Emergency Triage mode (text only)."""
    print("\n" + "="*60)
    print("🚨 EMERGENCY TRIAGE MODE")
    print("="*60)
    
    situation = "My 3-year-old labrador ate about 2 squares of dark chocolate from a candy bar about 45 minutes ago. He weighs about 30kg and seems normal right now but I'm worried."
    
    prompt = f"""You are PawWise Emergency Triage. A dog owner is worried about their dog.

Dog details: Breed: Labrador. Age: 3 years. Weight: 30 kg.
Owner's description: "{situation}"

Provide emergency triage in this JSON format:
{{
    "urgency": "green" | "yellow" | "orange" | "red",
    "urgency_label": "Clear one-line verdict",
    "assessment": "2-3 sentence explanation of what's likely happening",
    "immediate_actions": ["what to do RIGHT NOW, step by step"],
    "watch_for": ["signs that indicate it's getting WORSE"],
    "vet_questions": ["questions the vet will ask"],
    "timeframe": "how urgently they need to act",
    "voice_summary": "Calm, reassuring 2-3 sentence spoken summary."
}}

Err on the side of caution. Better to say go to vet than miss something serious."""

    result = call_nova(prompt)
    print(json.dumps(result, indent=2))
    return result


def test_behavior_decoder():
    """Test Behavior Decoder mode."""
    print("\n" + "="*60)
    print("🧠 BEHAVIOR DECODER MODE")
    print("="*60)
    
    situation = "My 2-year-old border collie keeps nipping at my kids' heels when they run around the house. It's not aggressive — more like he's trying to round them up. Is this normal?"
    
    prompt = f"""You are PawWise, a friendly dog behavior expert.

Dog details: Breed: Border Collie. Age: 2 years.
Owner's description: "{situation}"

Provide a behavioral assessment in this JSON format:
{{
    "urgency": "green" | "yellow" | "orange" | "red",
    "urgency_label": "one-line summary",
    "behavior_explanation": "Why the dog is likely doing this (2-3 sentences)",
    "is_normal": true/false,
    "breed_context": "How this behavior relates to the breed's instincts",
    "possible_causes": ["list of likely causes"],
    "what_to_do": ["specific, actionable training steps"],
    "when_to_worry": "when this behavior becomes concerning",
    "voice_summary": "Warm 2-3 sentence spoken summary."
}}

Be practical. No jargon. Explain WHY the dog does this."""

    result = call_nova(prompt)
    print(json.dumps(result, indent=2))
    return result


def test_dog_court(image_path):
    """Test Dog Court mode."""
    print("\n" + "="*60)
    print("🏛️ DOG COURT MODE")
    print("="*60)
    
    # Step 1: Analyze crime
    analysis_prompt = """You are a forensic investigator for DOG COURT. Analyze this image of a dog's "crime scene."
Identify what the dog did, the evidence, the breed, and suggest a funny defendant name.
Respond in JSON: {"crime": "...", "evidence": ["..."], "dog_breed": "...", "dog_name": "...", "severity": "misdemeanor|felony"}
Be funny and dramatic."""

    print("\nStep 1: Analyzing crime scene...")
    analysis = call_nova(analysis_prompt, image_path)
    print(json.dumps(analysis, indent=2))
    
    # Step 2: Generate script
    script_prompt = f"""You write comedy for DOG COURT. Based on this crime: {json.dumps(analysis)}
Write a courtroom script. Characters: JUDGE (dry humor), DEFENSE (theatrical, absurd legal arguments), PROSECUTION (exasperated human), DEFENDANT (confused dog).
JSON format:
{{
    "case_title": "The People vs. [Name]",
    "charge": "formal humorous charge",
    "dialogue": [{{"speaker": "judge|defense|prosecution|defendant", "emotion": "tag", "line": "text under 200 chars"}}],
    "verdict": "NOT GUILTY",
    "verdict_reason": "humorous reason"
}}
6-8 lines total. Under 1800 chars total for all dialogue. Be genuinely funny!"""

    print("\nStep 2: Generating courtroom script...")
    script = call_nova(script_prompt)
    print(json.dumps(script, indent=2))
    return script


if __name__ == '__main__':
    # Use a test image if provided
    image_path = sys.argv[1] if len(sys.argv) > 1 else None
    
    print("🐾 PawWise — Testing with Amazon Bedrock Nova Pro")
    print(f"   Model: {MODEL_ID}")
    print(f"   Image: {image_path or 'None (text-only tests)'}")
    
    # Run text-only tests first
    test_emergency_triage()
    test_behavior_decoder()
    
    # Run image tests if image provided
    if image_path:
        test_health_check(image_path)
        test_dog_court(image_path)
    else:
        print("\n\n💡 To test image modes, run:")
        print("   python3 test_bedrock.py /path/to/dog-photo.jpg")
        print("\nYou can download a test image:")
        print("   wget -O test_dog.jpg 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/YellowLabradorLooking_new.jpg/1200px-YellowLabradorLooking_new.jpg'")
    
    print("\n\n✅ All tests complete!")
