# Gesture Audio Implementation

## Summary

Added audio feedback for gesture changes with the following features:

### ✨ Features
- **Sound on gesture change only** - No repetition while holding a gesture
- **Cached audio files** - Loads once, plays instantly
- **Debounced detection** - Uses existing gesture debouncer (300ms)
- **Per-hand tracking** - Left and right hands can trigger sounds independently

### 🔊 Sound Mappings
- 🤜 **Closed Fist** → `whoosh.mp3` (0.2s, 4.4KB)
- ✋ **Open Palm** → `chime.mp3` (1.95s, 31KB)
- 👍 **Thumbs Up** → `ding.mp3` (1.97s, 32KB)
- 👎 **Thumbs Down** → `buzz.mp3` (1.11s, 18KB)

### 📁 Files Added/Modified

**New Files:**
- `src/utils/gestureAudio.ts` - Audio playback with caching
- `public/sounds/whoosh.mp3` - Fist gesture sound
- `public/sounds/chime.mp3` - Palm gesture sound
- `public/sounds/ding.mp3` - Thumbs up sound
- `public/sounds/buzz.mp3` - Thumbs down sound
- `public/sounds/README.md` - Documentation for sounds

**Modified Files:**
- `src/hooks/useGestures.ts` - Added `playGestureSound()` call when debounced gesture is confirmed

### 🎵 Sound Sources
All sounds are from **Mixkit.co** (Free license - no attribution required):
- License: https://mixkit.co/license/
- Can be used in commercial projects
- No attribution required

### 💡 How It Works

1. **Detection**: MediaPipe detects hand landmarks
2. **Classification**: `gestureDetection.ts` identifies gesture type
3. **Debouncing**: `GestureDebouncer` confirms gesture after 300ms stability
4. **Audio Trigger**: `useGestures` hook calls `playGestureSound()` only when debouncer confirms a NEW gesture
5. **Playback**: Audio file is loaded from cache (or loaded if first time) and played

### 🔧 API

```typescript
// Play sound for a gesture type
import { playGestureSound } from '@/utils/gestureAudio';
playGestureSound(GestureType.CLOSED_FIST);

// Preload all sounds (optional - can call on user interaction)
import { preloadGestureSounds } from '@/utils/gestureAudio';
preloadGestureSounds();

// Adjust volume (0.0 to 1.0)
import { setGestureSoundVolume } from '@/utils/gestureAudio';
setGestureSoundVolume(0.7);
```

### ⚙️ Configuration

Audio settings in `gestureAudio.ts`:
- Default volume: `0.5` (50%)
- Debounce time: `300ms` (configured in `useGestures`)
- Sound format: MP3 (best browser compatibility)

### 🧪 Testing

1. Start dev server: `npm run dev`
2. Allow camera access
3. Make gestures:
   - Close fist → hear whoosh
   - Open palm → hear chime
   - Thumbs up → hear ding
   - Thumbs down → hear buzz
4. Hold gesture → no sound repetition
5. Change to different gesture → hear new sound

### 🎯 Browser Considerations

- **Autoplay Policy**: Sounds may be blocked until user interacts with page
- **Error Handling**: `playGestureSound()` catches and ignores autoplay errors
- **Format**: MP3 for maximum compatibility (all modern browsers)
- **Caching**: Audio elements cached in `Map` for instant replay

### 🔮 Future Enhancements

Possible improvements:
- Volume control UI
- Sound theme selection (different sound packs)
- Haptic feedback (on mobile devices)
- Spatial audio (sound direction based on hand position)
- Custom sound upload
- Mute/unmute toggle
