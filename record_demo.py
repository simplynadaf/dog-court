#!/usr/bin/env python3
"""
PawWise — Automated Demo Recording Script
Uses Playwright to record the full demo with real AI responses.
Records at 1920x1080, natural typing speed, real wait times.
"""

import os
import sys
import time
import json
from playwright.sync_api import sync_playwright

# Configuration
SITE_URL = 'https://simplynadaf.github.io/dog-court/'
RECORDING_DIR = '/tmp/pawwise-demo'
SCREENSHOTS_DIR = '/home/ubuntu/tech-challenges/devto-weekend-dog-days-aug2026/dog-court/screenshots'
PHOTOS_DIR = '/home/ubuntu/tech-challenges/devto-weekend-dog-days-aug2026/dog-court/test-photos'

# Gemini key for live AI calls
GEMINI_KEY = os.environ.get('GEMINI_API_KEY', '')
ELEVENLABS_KEY = os.environ.get('ELEVENLABS_API_KEY', '')

# Typing config
TYPING_DELAY = 55  # ms per character (natural human speed)
PAUSE_SHORT = 2000  # 2 seconds
PAUSE_MEDIUM = 4000  # 4 seconds
PAUSE_LONG = 6000  # 6 seconds


def setup_dirs():
    os.makedirs(RECORDING_DIR, exist_ok=True)
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


def screenshot(page, name):
    """Take a screenshot with a descriptive name."""
    path = os.path.join(SCREENSHOTS_DIR, f'{name}.png')
    page.screenshot(path=path, full_page=False)
    print(f'  📸 Screenshot: {name}.png')


def type_naturally(page, selector, text):
    """Type text character by character with natural speed."""
    element = page.locator(selector)
    element.click()
    time.sleep(0.3)
    page.keyboard.type(text, delay=TYPING_DELAY)


def wait(ms, label=''):
    """Wait with a label for debugging."""
    if label:
        print(f'  ⏳ Waiting {ms/1000}s — {label}')
    time.sleep(ms / 1000)


def main():
    setup_dirs()
    
    print('''
🐾 PawWise Demo Recording
━━━━━━━━━━━━━━━━━━━━━━━━━━
Recording to: {dir}
Screenshots to: {ss}
━━━━━━━━━━━━━━━━━━━━━━━━━━
'''.format(dir=RECORDING_DIR, ss=SCREENSHOTS_DIR))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir=RECORDING_DIR,
            record_video_size={'width': 1920, 'height': 1080},
        )
        page = context.new_page()

        # ============================================================
        # SCENE 1: Landing Page (15 seconds)
        # ============================================================
        print('\n🎬 SCENE 1: Landing Page')
        page.goto(SITE_URL)
        page.wait_for_load_state('networkidle')
        wait(3000, 'page fully loaded')
        
        screenshot(page, '01-hero')
        wait(5000, 'viewer absorbs hero')

        # Scroll down slowly to reveal modes
        page.evaluate('window.scrollBy({top: 400, behavior: "smooth"})')
        wait(2000, 'scrolling to modes')
        
        screenshot(page, '02-modes-visible')

        # ============================================================
        # SET API KEYS (before first analysis)
        # ============================================================
        print('\n🔑 Setting API Keys...')
        
        # Open keys modal
        page.click('#btn-keys')
        wait(2000, 'modal opens')
        
        # Type Gemini key naturally (character by character)
        print('  Typing Gemini key...')
        type_naturally(page, '#gemini-key', GEMINI_KEY)
        wait(1000)
        
        # Type ElevenLabs key naturally
        print('  Typing ElevenLabs key...')
        type_naturally(page, '#elevenlabs-key', ELEVENLABS_KEY)
        wait(1000)
        
        # Save
        page.click('#btn-save-keys')
        wait(1500, 'keys saved')

        # ============================================================
        # SCENE 2: Health Check Mode (60-70 seconds)
        # ============================================================
        print('\n🎬 SCENE 2: Health Check')
        
        # Scroll to workspace
        page.evaluate('document.getElementById("workspace").scrollIntoView({behavior: "smooth"})')
        wait(2000, 'scrolled to workspace')

        # Step 2.2: Fill dog profile
        print('  Filling dog profile...')
        page.evaluate('() => { document.querySelector("details#profile-panel").open = true; }')
        wait(1000, 'profile expanded')
        
        type_naturally(page, '#dog-breed', 'Golden Retriever')
        wait(300)
        type_naturally(page, '#dog-age', '3 years')
        wait(300)
        type_naturally(page, '#dog-weight', '28 kg')
        wait(300)
        type_naturally(page, '#dog-name', 'Buddy')
        wait(PAUSE_SHORT, 'profile filled')
        
        screenshot(page, '03-profile-filled')

        # Step 2.3: Upload healthy dog photo
        print('  Uploading healthy dog photo...')
        photo_path = os.path.join(PHOTOS_DIR, 'Healthy Dog.webp')
        
        # Trigger file upload
        file_input = page.locator('#file-input')
        file_input.set_input_files(photo_path)
        wait(PAUSE_SHORT, 'photo uploaded')
        
        screenshot(page, '04-photo-uploaded')

        # Step 2.4: Run demo analysis
        print('  Analyzing health...')
        page.click('#btn-analyze')
        wait(3000, 'loading animation visible')
        
        screenshot(page, '05-loading')
        
        # Wait for results (loading takes 20-25s with progressive messages)
        try:
            page.wait_for_selector('.urgency', timeout=40000)
        except:
            print('  ⚠️ Timeout waiting for health results')
        
        wait(PAUSE_SHORT, 'results appeared')
        screenshot(page, '06-health-results-green')
        
        # Scroll to show Body Condition Score prominently
        page.evaluate('document.querySelector(".report-section").scrollIntoView({behavior: "smooth", block: "center"})')
        wait(PAUSE_MEDIUM, 'viewing body condition score')
        
        screenshot(page, '07-health-score-detail')

        # Scroll through full report
        page.evaluate('document.querySelector(".report").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_MEDIUM, 'viewing full report')
        
        screenshot(page, '08-health-report-detail')

        # Play voice (if available)
        print('  Playing voice summary...')
        try:
            voice_btn = page.locator('#btn-play')
            if voice_btn.is_visible():
                voice_btn.click()
                wait(10000, 'voice playing')
                screenshot(page, '09-voice-playing')
        except:
            print('  ⚠️ Voice player not available')

        # ============================================================
        # SCENE 3: Behavior Decoder Mode
        # ============================================================
        print('\n🎬 SCENE 3: Behavior Decoder')
        
        # Click New Check
        page.click('#btn-new')
        wait(PAUSE_SHORT, 'reset to input')

        # Switch to Behavior mode
        print('  Switching to Behavior mode...')
        page.click('.mode-card[data-mode="behavior"]')
        wait(PAUSE_SHORT, 'mode switched')
        
        screenshot(page, '10-behavior-mode')

        # Scroll to workspace
        page.evaluate('document.getElementById("workspace").scrollIntoView({behavior: "smooth"})')
        wait(1000)

        # Fill dog profile for behavior
        print('  Filling dog profile...')
        page.evaluate('() => { document.querySelector("details#profile-panel").open = true; }')
        wait(1000, 'profile expanded')
        
        type_naturally(page, '#dog-breed', 'Golden Retriever')
        wait(300)
        type_naturally(page, '#dog-age', '3 years')
        wait(300)
        type_naturally(page, '#dog-weight', '28 kg')
        wait(300)
        type_naturally(page, '#dog-name', 'Buddy')
        wait(PAUSE_SHORT, 'profile filled')

        # Upload odd behavior photo
        print('  Uploading behavior photo...')
        behavior_photo = os.path.join(PHOTOS_DIR, 'Dog doing something odd(sleeping odd).jpg')
        file_input = page.locator('#file-input')
        file_input.set_input_files(behavior_photo)
        wait(PAUSE_SHORT, 'behavior photo uploaded')

        # Type behavior description
        print('  Typing behavior description...')
        behavior_text = 'My dog keeps sleeping in this weird position with his legs spread out. Is this normal for a Golden Retriever?'
        type_naturally(page, '#situation-input', behavior_text)
        wait(PAUSE_MEDIUM, 'behavior described')
        
        screenshot(page, '11-behavior-input')

        # Analyze behavior
        print('  Analyzing behavior...')
        page.click('#btn-analyze')
        wait(3000, 'loading animation')
        
        screenshot(page, '12-behavior-loading')
        
        try:
            page.wait_for_selector('.urgency', timeout=40000)
        except:
            print('  ⚠️ Timeout waiting for behavior results')
        
        wait(PAUSE_SHORT, 'behavior results')
        screenshot(page, '13-behavior-results')
        
        # Scroll through behavior report
        page.evaluate('document.querySelector(".report").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_LONG, 'reading behavior report')
        
        screenshot(page, '14-behavior-report-detail')

        # Play voice
        print('  Playing behavior voice...')
        try:
            voice_btn = page.locator('#btn-play')
            if voice_btn.is_visible():
                voice_btn.click()
                wait(10000, 'behavior voice playing')
        except:
            pass

        # ============================================================
        # SCENE 4: Emergency Triage Mode
        # ============================================================
        print('\n🎬 SCENE 4: Emergency Triage')
        
        # Click New Check
        page.click('#btn-new')
        wait(PAUSE_SHORT, 'reset to input')

        # Switch to Emergency mode
        print('  Switching to Emergency mode...')
        page.click('.mode-card[data-mode="emergency"]')
        wait(PAUSE_SHORT, 'mode switched')
        
        screenshot(page, '15-emergency-mode')

        # Scroll to workspace
        page.evaluate('document.getElementById("workspace").scrollIntoView({behavior: "smooth"})')
        wait(1000)

        # Fill dog profile for emergency
        print('  Filling dog profile...')
        page.evaluate('() => { document.querySelector("details#profile-panel").open = true; }')
        wait(1000, 'profile expanded')
        
        type_naturally(page, '#dog-breed', 'Golden Retriever')
        wait(300)
        type_naturally(page, '#dog-age', '3 years')
        wait(300)
        type_naturally(page, '#dog-weight', '28 kg')
        wait(300)
        type_naturally(page, '#dog-name', 'Buddy')
        wait(PAUSE_SHORT, 'profile filled')

        # Upload worried dog photo for emergency
        print('  Uploading worried dog photo...')
        emergency_photo = os.path.join(PHOTOS_DIR, 'Dog looking unwell worried.avif')
        file_input = page.locator('#file-input')
        file_input.set_input_files(emergency_photo)
        wait(PAUSE_SHORT, 'emergency photo uploaded')

        # Type situation description
        print('  Typing situation...')
        situation_text = 'My dog Buddy has been very low energy since yesterday morning. He is not eating his food which is unusual for him. His eyes look droopy and he just wants to sleep all day.'
        
        type_naturally(page, '#situation-input', situation_text)
        wait(PAUSE_MEDIUM, 'situation typed')
        
        screenshot(page, '16-emergency-situation-typed')

        # Assess urgency
        print('  Assessing urgency...')
        page.click('#btn-analyze')
        wait(3000, 'loading animation')
        
        screenshot(page, '17-emergency-loading')
        
        # Wait for results
        try:
            page.wait_for_selector('.urgency', timeout=40000)
        except:
            print('  ⚠️ Timeout waiting for emergency results')
        
        wait(PAUSE_SHORT, 'emergency results')
        screenshot(page, '18-emergency-results')
        
        # Scroll through emergency results
        page.evaluate('document.querySelector(".report").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_LONG, 'reading emergency report')
        
        screenshot(page, '19-emergency-report-detail')

        # Play voice
        print('  Playing emergency voice...')
        try:
            voice_btn = page.locator('#btn-play')
            if voice_btn.is_visible():
                voice_btn.click()
                wait(10000, 'emergency voice playing')
        except:
            pass

        # ============================================================
        # SCENE 5: Dog Court Mode
        # ============================================================
        print('\n🎬 SCENE 5: Dog Court')
        
        # Click New Check
        page.click('#btn-new')
        wait(PAUSE_SHORT, 'reset')

        # Switch to Court mode
        print('  Switching to Dog Court mode...')
        page.click('.mode-card[data-mode="court"]')
        wait(PAUSE_SHORT, 'court mode')
        
        screenshot(page, '20-court-mode')

        # Scroll to workspace
        page.evaluate('document.getElementById("workspace").scrollIntoView({behavior: "smooth"})')
        wait(1000)

        # Upload crime scene photo
        print('  Uploading crime scene...')
        crime_photo = os.path.join(PHOTOS_DIR, 'dog-destroys-pillows.jpg')
        file_input = page.locator('#file-input')
        file_input.set_input_files(crime_photo)
        wait(PAUSE_MEDIUM, 'crime scene uploaded')
        
        screenshot(page, '21-crime-scene-uploaded')

        # File charges
        print('  Filing charges...')
        page.click('#btn-analyze')
        wait(3000, 'loading animation')
        
        screenshot(page, '22-court-loading')
        
        # Wait for court results
        try:
            page.wait_for_selector('#court:not(.hidden)', timeout=40000)
        except:
            print('  ⚠️ Timeout waiting for court results')
        
        wait(PAUSE_SHORT, 'court results appeared')
        screenshot(page, '23-court-case-title')
        
        # Scroll through transcript
        page.evaluate('document.querySelector(".court").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_LONG, 'reading transcript')
        
        screenshot(page, '24-court-transcript')

        # Play trial audio
        print('  Playing trial audio...')
        try:
            court_play = page.locator('#court-play')
            if court_play.is_visible():
                court_play.click()
                wait(35000, 'multi-voice trial audio playing')
                screenshot(page, '25-court-audio-playing')
        except:
            print('  ⚠️ Court audio not available')
            wait(5000)

        # Scroll to verdict
        page.evaluate('document.querySelector(".court-verdict").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_LONG, 'viewing verdict')
        
        screenshot(page, '26-verdict-not-guilty')

        # ============================================================
        # SCENE 6: Closing
        # ============================================================
        print('\n🎬 SCENE 6: Closing')
        
        # Scroll back to top
        page.evaluate('window.scrollTo({top: 0, behavior: "smooth"})')
        wait(PAUSE_LONG, 'final view')
        
        screenshot(page, '27-final-view')

        # ============================================================
        # DONE
        # ============================================================
        print('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━')
        print('✅ RECORDING COMPLETE!')
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━')
        
        # Save video
        video_path = page.video.path()
        context.close()
        browser.close()
        
        # Rename video
        final_video = os.path.join(RECORDING_DIR, 'pawwise-demo.webm')
        if video_path and os.path.exists(video_path):
            os.rename(video_path, final_video)
            print(f'\n🎥 Video saved: {final_video}')
            print(f'   Size: {os.path.getsize(final_video) / 1024 / 1024:.1f} MB')
        
        print(f'\n📸 Screenshots saved: {SCREENSHOTS_DIR}/')
        print(f'   Total: {len(os.listdir(SCREENSHOTS_DIR))} screenshots')
        
        print(f'\n📋 Next steps:')
        print(f'   1. Convert video: ffmpeg -i {final_video} -c:v libx264 pawwise-demo.mp4')
        print(f'   2. Review screenshots in {SCREENSHOTS_DIR}/')
        print(f'   3. Upload to S3: aws s3 cp pawwise-demo.mp4 s3://sarvars-youtube-videos/dog/')


if __name__ == '__main__':
    main()
