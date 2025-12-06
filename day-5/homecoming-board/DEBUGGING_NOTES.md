# Hand Tracking Implementation - Debugging Notes

## Current Status: BLOCKED on MediaPipe Initialization

### Issue
MediaPipe Hands fails to initialize with error:
```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'loadGraph')
```

### What Works ✅
1. Webcam access - successfully gets video stream
2. Video element rendering - displays mirrored feed
3. Video element passed to MediaPipe hook
4. MediaPipe modules imported dynamically
5. MediaPipe Hands instance created
6. Frame processing loop starts

### What Doesn't Work ❌
1. MediaPipe WASM/model files fail to load properly
2. Hand detection never starts
3. No FPS counter appears
4. No hand skeleton overlay

### Solutions Attempted

#### Attempt 1: CDN Loading
```typescript
locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}
```
**Result:** loadGraph error

#### Attempt 2: Local Files
- Copied MediaPipe files to `public/mediapipe/`
- Updated locateFile to use `/mediapipe/${file}`
- Files confirmed present:
  - hands_solution_wasm_bin.wasm (5.9MB)
  - hands_solution_simd_wasm_bin.wasm (6MB)
  - hand_landmark_full.tflite (5.5MB)
  - hand_landmark_lite.tflite (2MB)
  - hands.binarypb
  - hands_solution_packed_assets.data (4.3MB)
  - All associated .js files

**Result:** Same loadGraph error

#### Attempt 3: Manual Frame Processing
- Removed MediaPipe Camera utility (was causing WebGL errors)
- Used requestAnimationFrame to send frames manually
- Added try-catch around frame processing

**Result:** Still fails at initialization

### Architecture

**Files Created:**
```
homecoming-board/src/
├── types/hand.ts              ✅ Type definitions
├── hooks/
│   ├── useWebcam.ts          ✅ Webcam management
│   └── useMediaPipe.ts       ❌ MediaPipe integration (failing)
├── components/
│   ├── WebcamFeed.tsx        ✅ Video display
│   └── HandTracker.tsx       ⚠️  Main component (blocked)
└── routes/index.tsx          ✅ Test page

public/mediapipe/             ✅ MediaPipe files copied
```

### Code Flow

1. **WebcamFeed** mounts → requests camera → gets stream → attaches to video element
2. **Video** element passed to HandTracker via `onVideoReady` callback
3. **HandTracker** passes video element to `useMediaPipe` hook
4. **useMediaPipe** initializes:
   - Dynamically imports `@mediapipe/hands`
   - Creates Hands instance with locateFile
   - Sets options (maxNumHands: 2, modelComplexity: 1, etc.)
   - Sets up onResults callback
   - Starts requestAnimationFrame loop
   - Calls `hands.send({ image: videoElement })`
5. **ERROR** occurs when MediaPipe tries to load its graph/models

### Console Output
```
✅ Webcam access granted!
✅ Video element stream attached via effect
✅ Video loadeddata event - calling onVideoReady
🤖 Initializing MediaPipe...
📦 Loading MediaPipe modules...
✅ MediaPipe modules loaded
🖐️ Creating Hands instance...
⚙️ Configuring Hands with: {maxNumHands: 2, modelComplexity: 1, ...}
📹 Setting up camera...
▶️ Starting manual frame processing...
❌ Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'loadGraph')
```

### Possible Root Causes

1. **WASM Loading Issue**: MediaPipe can't load/initialize WASM module
   - locateFile may not be working correctly
   - WASM files may need special headers
   - Vite may not be serving files correctly

2. **Missing Dependencies**: MediaPipe may need additional files
   - graph files?
   - additional configuration?

3. **Initialization Sequence**: May need to initialize differently
   - `hands.initialize()` doesn't exist in API
   - First frame may trigger initialization but fails

4. **SSR/Hydration Issue**: TanStack Start SSR might interfere
   - Already using dynamic imports
   - Already checking `typeof window`

### Next Steps to Try

1. **Check Network Tab**: Verify which files are 404ing
2. **Vite Config**: May need special config for WASM files
3. **Different MediaPipe Package**: Try `@mediapipe/tasks-vision` instead
4. **Alternative Library**: Consider TensorFlow.js HandPose
5. **Simpler Test**: Create minimal MediaPipe test outside TanStack Start

### Dependencies
```json
{
  "@mediapipe/hands": "^0.4.1646424915",
  "@mediapipe/camera_utils": "^0.3.1620248595",
  "@mediapipe/drawing_utils": "^0.3.1620248595"
}
```

### Environment
- Framework: TanStack Start (React SSR)
- Build Tool: Vite
- Browser: Chrome (latest)
- OS: macOS

### What User Sees
- Video feed showing (mirrored) ✅
- "👋 Hand Tracking Active" message at bottom ✅
- "Initializing hand tracking..." in blue box (indefinite)
- No FPS counter
- No hand detection indicators
- No green skeleton overlay

---

## Session 2 Progress (Dec 6, 2024)

### Attempt 1: MediaPipe tasks-vision ❌
**Issue**: Still getting WebGL/activeTexture errors even with CPU delegate
- Error: `TypeError: Cannot read properties of undefined (reading 'activeTexture')`
- The WASM bundle appears to require WebGL even when set to CPU mode

### ✅ Attempt 2: Switched to TensorFlow.js! 

**Final Solution**: Use `@tensorflow/tfjs` + `@tensorflow-models/hand-pose-detection`
- More reliable in browser environments
- Better compatibility with Vite/modern build tools
- Uses MediaPipe Hands model through TensorFlow.js runtime

**Key Changes**:
1. Installed:
   - `@tensorflow/tfjs`
   - `@tensorflow-models/hand-pose-detection`
2. Rewrote `useMediaPipe.ts` to use:
   - `handPoseDetection.createDetector()` with MediaPipeHands model
   - `estimateHands()` for frame processing
   - TensorFlow.js backend (WebGL or CPU, auto-selected)
3. Updated drawing functions for TensorFlow.js keypoint format (absolute coordinates)

**Current Status**: Testing in browser (1:13 AM)...

---

## For Next Session

**Priority 1**: Verify hand tracking works
- Check browser console for successful initialization
- Test hand detection with camera
- Verify FPS counter appears
- Confirm green skeleton overlay draws

**Priority 2**: Implement gesture detection
- Closed fist detection (finger curled in)
- Open palm detection (fingers extended)
- Add visual feedback for detected gestures

**Priority 3**: Build flight board UI
- Add flight data with TanStack Start server functions
- Create winter-themed UI
- Implement gesture-based navigation
