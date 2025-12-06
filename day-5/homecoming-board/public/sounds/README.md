# Gesture Sound Files

This directory contains sound effects for gesture recognition.

## Required Files:
- `whoosh.mp3` - For CLOSED_FIST gesture
- `chime.mp3` - For OPEN_PALM gesture  
- `ding.mp3` - For THUMBS_UP gesture
- `buzz.mp3` - For THUMBS_DOWN gesture

## Where to Get Sounds:

### Option 1: Free Sound Libraries (CC0 - No Attribution Required)
- **Freesound.org**: Search for "whoosh", "chime", "ding", "buzz"
- **Zapsplat.com**: Free with account (personal use)
- **Pixabay Sounds**: https://pixabay.com/sound-effects/

### Option 2: Generate with Online Tools
- **Bfxr**: https://www.bfxr.net/ (retro game sounds generator)
- **ChipTone**: https://sfbgames.itch.io/chiptone

### Option 3: Use provided sounds from npm packages
```bash
npm install --save-dev tone
```

## Sound Requirements:
- Format: MP3 (best browser compatibility)
- Duration: 0.1-0.5 seconds (short and snappy)
- Size: Keep under 50KB each
- Volume: Normalized, not too loud

## Quick Downloads:

You can use these search queries on Freesound.org:
1. "whoosh short" - swoosh sound for fist
2. "bell chime soft" - gentle notification for palm
3. "ding notification" - positive confirmation for thumbs up
4. "buzz short" - negative beep for thumbs down
