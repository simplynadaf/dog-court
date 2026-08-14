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
        wait(1000, 'modal opens')
        
        # Enter Gemini key
        page.fill('#gemini-key', GEMINI_KEY)
        wait(500)
        
        # Enter ElevenLabs key
        page.fill('#elevenlabs-key', ELEVENLABS_KEY)
        wait(500)
        
        # Save
        page.click('#btn-save-keys')
        wait(1000, 'keys saved')

        # ============================================================
        # SCENE 2: Health Check Mode (60-70 seconds)
        # ============================================================
        print('\n🎬 SCENE 2: Health Check')
        
        # Scroll to workspace
        page.evaluate('document.getElementById("workspace").scrollIntoView({behavior: "smooth"})')
        wait(2000, 'scrolled to workspace')

        # Step 2.2: Fill dog profile
        print('  Filling dog profile...')
        page.click('details#profile-panel summary')
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

        # Step 2.4: Click analyze
        print('  Analyzing health...')
        page.click('#btn-analyze')
        wait(1000, 'clicked analyze')
        
        screenshot(page, '05-loading')
        
        # Wait for results (API call takes 8-15 seconds)
        try:
            page.wait_for_selector('.urgency', timeout=30000)
        except:
            print('  ⚠️ Timeout waiting for results, trying demo mode...')
            page.click('#btn-demo')
            page.wait_for_selector('.urgency', timeout=10000)
        
        wait(PAUSE_SHORT, 'results appeared')
        screenshot(page, '06-health-results-green')
        
        # Scroll through results
        page.evaluate('document.querySelector(".ws-results").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_MEDIUM, 'viewing results')
        
        screenshot(page, '07-health-report-detail')

        # Step 2.6: Play voice (if available)
        print('  Playing voice summary...')
        try:
            voice_btn = page.locator('#btn-play')
            if voice_btn.is_visible():
                voice_btn.click()
                wait(10000, 'voice playing')
                screenshot(page, '08-voice-playing')
        except:
            print('  ⚠️ Voice player not available')

        # ============================================================
        # SCENE 3: Emergency Triage Mode (60-70 seconds)
        # ============================================================
        print('\n🎬 SCENE 3: Emergency Triage')
        
        # Click New Check
        page.click('#btn-new')
        wait(PAUSE_SHORT, 'reset to input')

        # Switch to Emergency mode
        print('  Switching to Emergency mode...')
        page.click('.mode-card[data-mode="emergency"]')
        wait(PAUSE_SHORT, 'mode switched')
        
        screenshot(page, '09-emergency-mode')

        # Scroll to workspace
        page.evaluate('document.getElementById("workspace").scrollIntoView({behavior: "smooth"})')
        wait(1000)

        # Type situation description
        print('  Typing situation...')
        situation_text = 'My dog Buddy has been very low energy since yesterday morning. He is not eating his food which is unusual for him. His eyes look droopy and he just wants to sleep all day. He is 3 years old and normally very active.'
        
        type_naturally(page, '#situation-input', situation_text)
        wait(PAUSE_MEDIUM, 'situation typed')
        
        screenshot(page, '10-situation-typed')

        # Analyze
        print('  Assessing urgency...')
        page.click('#btn-analyze')
        wait(1000)
        
        # Wait for results
        try:
            page.wait_for_selector('.urgency', timeout=30000)
        except:
            print('  ⚠️ Timeout, using demo...')
            page.click('#btn-demo')
            page.wait_for_selector('.urgency', timeout=10000)
        
        wait(PAUSE_SHORT, 'emergency results')
        screenshot(page, '11-emergency-yellow')
        
        # Scroll through emergency results
        page.evaluate('document.querySelector(".report").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_LONG, 'reading emergency report')
        
        screenshot(page, '12-emergency-details')

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
        # SCENE 4: Dog Court Mode (70-80 seconds)
        # ============================================================
        print('\n🎬 SCENE 4: Dog Court')
        
        # Click New Check
        page.click('#btn-new')
        wait(PAUSE_SHORT, 'reset')

        # Switch to Court mode
        print('  Switching to Dog Court mode...')
        page.click('.mode-card[data-mode="court"]')
        wait(PAUSE_SHORT, 'court mode')
        
        screenshot(page, '13-court-mode')

        # Scroll to workspace
        page.evaluate('document.getElementById("workspace").scrollIntoView({behavior: "smooth"})')
        wait(1000)

        # Upload crime scene photo
        print('  Uploading crime scene...')
        crime_photo = os.path.join(PHOTOS_DIR, 'dog-destroys-pillows.jpg')
        file_input = page.locator('#file-input')
        file_input.set_input_files(crime_photo)
        wait(PAUSE_MEDIUM, 'crime scene uploaded')
        
        screenshot(page, '14-crime-scene-uploaded')

        # File charges
        print('  Filing charges...')
        page.click('#btn-analyze')
        wait(1000)
        
        screenshot(page, '15-court-loading')
        
        # Wait for court results (takes longer - 2 API calls + audio generation)
        try:
            page.wait_for_selector('.court', timeout=45000)
        except:
            print('  ⚠️ Timeout, using demo...')
            page.click('#btn-demo') 
            page.wait_for_selector('.court', timeout=10000)
        
        wait(PAUSE_SHORT, 'court results appeared')
        screenshot(page, '16-court-case-title')
        
        # Scroll through transcript
        page.evaluate('document.querySelector(".court").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_LONG, 'reading transcript')
        
        screenshot(page, '17-court-transcript')

        # Play trial audio
        print('  Playing trial audio...')
        try:
            court_play = page.locator('#court-play')
            if court_play.is_visible():
                court_play.click()
                wait(35000, 'multi-voice trial audio playing')
                screenshot(page, '18-court-audio-playing')
        except:
            print('  ⚠️ Court audio not available')
            wait(5000)

        # Scroll to verdict
        page.evaluate('document.querySelector(".court-verdict").scrollIntoView({behavior: "smooth"})')
        wait(PAUSE_LONG, 'viewing verdict')
        
        screenshot(page, '19-verdict-not-guilty')

        # ============================================================
        # SCENE 5: Closing (10 seconds)
        # ============================================================
        print('\n🎬 SCENE 5: Closing')
        
        # Scroll back to top
        page.evaluate('window.scrollTo({top: 0, behavior: "smooth"})')
        wait(PAUSE_LONG, 'final view')
        
        screenshot(page, '20-final-view')

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
