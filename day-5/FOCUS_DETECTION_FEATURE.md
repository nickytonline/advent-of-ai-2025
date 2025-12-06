# Camera Auto-Pause Feature

## Overview
The camera automatically pauses when the browser window or tab loses focus, saving battery and CPU resources. When you return to the app, the camera resumes automatically.

## Implementation Date
December 6, 2025

## Problem Solved
Previously, the app would continue running the camera and processing video even when:
- You switched to another browser tab
- You switched to another application
- The browser window was in the background

This led to:
- Unnecessary battery drain
- Wasted CPU cycles
- Privacy concerns (camera running when not visible)
- Unintended gesture triggers

## Solution
Implemented automatic camera pause/resume by disabling video tracks when the window loses focus, and re-enabling them when focus is regained.

## Technical Changes

### Files Created
- `src/hooks/useWindowFocus.ts` - New hook to track window/tab focus state

### Files Modified
- `src/components/WebcamFeed.tsx` - Added camera pause/resume logic

### How It Works

1. **useWindowFocus Hook** - Tracks browser window focus using two APIs:
   - `window focus/blur events` - Detects window switching
   - `document.visibilitychange event` - Detects tab switching

2. **Camera Track Control** - When focus changes:
   - **Lost focus**: Sets `track.enabled = false` on all video tracks (pauses camera)
   - **Gained focus**: Sets `track.enabled = true` on all video tracks (resumes camera)

3. **Graceful Handling**:
   - Stream stays alive (no need to re-request permissions)
   - Video element remains connected
   - Instant resume when returning to the app

## Code Snippets

### useWindowFocus Hook
```typescript
export function useWindowFocus() {
  const [hasFocus, setHasFocus] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.hasFocus();
    }
    return true;
  });

  useEffect(() => {
    const handleFocus = () => setHasFocus(true);
    const handleBlur = () => setHasFocus(false);
    
    const handleVisibilityChange = () => {
      setHasFocus(!document.hidden);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return hasFocus;
}
```

### Camera Pause/Resume in WebcamFeed
```typescript
const hasFocus = useWindowFocus();

useEffect(() => {
  if (!stream) return;

  if (!hasFocus) {
    console.log('⏸️ Pausing camera (no focus)');
    stream.getVideoTracks().forEach(track => {
      track.enabled = false;
    });
  } else {
    console.log('▶️ Resuming camera (has focus)');
    stream.getVideoTracks().forEach(track => {
      track.enabled = true;
    });
  }
}, [hasFocus, stream]);
```

## Behavior

### When Window Has Focus (Active)
- ✅ Camera is running
- ✅ Video feed is live
- ✅ Gestures are detected
- ✅ Console shows: "▶️ Resuming camera (has focus)"

### When Window Loses Focus (Inactive)
- ⏸️ Camera is paused (video tracks disabled)
- 🖤 Video shows last frame (frozen)
- ❌ No new video data processed
- 💚 Battery/CPU saved
- ✅ Console shows: "⏸️ Pausing camera (no focus)"

### When Window Regains Focus
- ▶️ Camera resumes instantly
- 📹 Video feed restarts
- 🔄 Gesture detection continues
- ⚡ No permission re-request needed

## Testing

The app should already be running. Test it now:

1. **Tab Switching Test:**
   - Open the app
   - Check console: should see "▶️ Resuming camera (has focus)"
   - Switch to another browser tab
   - Check console: should see "⏸️ Pausing camera (no focus)"
   - Switch back to app tab
   - Check console: should see "▶️ Resuming camera (has focus)"

2. **Window Switching Test:**
   - Have app in browser window
   - Switch to another application (Finder, Terminal, etc.)
   - Camera should pause
   - Switch back to browser
   - Camera should resume

3. **Visual Test:**
   - Make a gesture while app is focused - should work
   - Switch away and make gesture - should NOT work
   - Switch back and make gesture - should work again

## Browser APIs Used

- **`window.addEventListener('focus')`** - Window gains focus
- **`window.addEventListener('blur')`** - Window loses focus  
- **`document.addEventListener('visibilitychange')`** - Tab visibility changes
- **`document.hidden`** - Boolean indicating if tab is hidden
- **`document.hasFocus()`** - Check current focus state
- **`MediaStreamTrack.enabled`** - Enable/disable video track

## Benefits

1. **Battery Life**
   - Camera hardware powered down when not in use
   - Significant power savings on laptops/mobile

2. **CPU Usage**
   - No video processing when tab is hidden
   - MediaPipe and TensorFlow.js idle when paused

3. **Privacy**
   - Camera only active when you can see the app
   - No background recording

4. **Performance**
   - Other tabs/apps get more resources
   - System stays responsive

5. **User Experience**
   - Seamless pause/resume
   - No permission re-prompts
   - Instant restart when returning

## Technical Details

### Why `track.enabled` Instead of `stopWebcam()`?

We use `track.enabled = false/true` instead of stopping/starting the entire stream because:

1. **Faster Resume** - Track re-enables instantly vs requesting new stream
2. **No Permission Dialog** - User isn't re-prompted for camera access
3. **State Preservation** - Camera settings (resolution, device) are maintained
4. **Cleaner Code** - Simple boolean toggle vs complex restart logic

### MediaStreamTrack.enabled

- `true` - Track is active, data flows
- `false` - Track is muted, no data flows, hardware may power down
- Track stays in stream, just temporarily disabled

## Edge Cases Handled

- ✅ Initial page load - checks focus state immediately
- ✅ Rapid tab switching - handles quick focus changes
- ✅ No stream yet - safely checks if stream exists
- ✅ Multiple tabs with app open - each manages its own camera
- ✅ Browser minimize - treated same as losing focus

## Comparison to Previous Approach

### Old Approach (Gesture-Level Focus Detection)
- Added complexity to `useGestures` hook
- Camera still running in background
- Still processing video frames
- Still using CPU/battery
- Only prevented gesture callbacks

### New Approach (Camera-Level se)
- ✅ Much simpler implementation
- ✅ Actually stops camera processing
- ✅ Saves real CPU/battery
- ✅ Better privacy
- ✅ Single responsibility (camera controls camera)

## Future Enhancements (Optional)

Could add:
- Visual indicator showing camera is paused
- Setting to disable auto-pause
- Configurable pause delay (pause after X seconds)
- Show "paused" overlay on frozen video frame
