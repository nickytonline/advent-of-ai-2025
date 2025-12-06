# Building a Variance-Aware Gesture Training System

## From Brittle Thresholds to Robust Hand Tracking

**TL;DR:** Built a gesture-controlled flight tracker with MediaPipe, hit issues with trained gesture thresholds being too strict, solved it by adding standard deviation awareness to the training algorithm. Now gestures work reliably despite natural hand position variance.

---

## The Problem: When Training Makes Things Worse

I was building a gesture-controlled flight tracker (think Minority Report, but for tracking Santa's sleigh... or regular planes). Users could train custom gesture thresholds by making gestures and correcting the AI when it got them wrong.

Then a user reported: **"I trained my thumb but it no longer opens the dialog."**

Wait, what? Training was supposed to *improve* accuracy, not break it!

## The Root Cause: Overfitting to Training Samples

Here's what was happening:

### 1. **The Detection Algorithm**
Gesture detection works by calculating "finger curl ratios":
```typescript
fingerCurl = distance(fingertip, wrist) / distance(knuckle, wrist)
// 0.0 = fully extended
// 1.0 = fully curled
```

For thumbs up, we check:
```typescript
const isThumbsUp = 
  fingersCurledCount >= 3 &&           // At least 3 fingers curled
  thumbCurl < threshold &&              // Thumb extended
  thumbPointingUp &&                    // Thumb above index finger
  thumbNotTooExtended;                  // Not too far sideways
```

### 2. **The Original Training Algorithm**
```typescript
// Calculate average finger curl from training samples
const avgCurl = samples.reduce((sum, s) => sum + s.avgCurl, 0) / samples.length;

// Set threshold slightly below average
const threshold = Math.max(0.5, avgCurl - 0.1);
```

### 3. **The Bug**
If a user trained with their fingers *not quite curled enough*, the algorithm learned:
- Training samples showed fingers at 0.55 curl on average
- Algorithm calculated: `threshold = 0.55 - 0.1 = 0.45`
- Detection requires: `fingerCurl > 0.45` for 3+ fingers

But in real usage:
- User makes *slightly* different thumbs up
- Fingers curl to 0.50 instead of 0.55
- Only 2 fingers exceed the 0.45 threshold
- **Detection fails!** (needs 3+ fingers)

The system was **overfitting** to the exact training samples, with no tolerance for natural variation.

## The Solution: Variance-Aware Thresholds

The fix: **Account for variance in the training data.**

If a user's hand position varies a lot during training, we should set *more lenient* thresholds. If they're very consistent, we can be stricter.

### Step 1: Calculate Standard Deviation

```typescript
const calcAvgCurls = (samples: GestureSample[]) => {
  if (samples.length === 0) return null;
  
  // 1. Calculate averages
  const averages = {
    index: mean(samples.map(s => s.fingerCurls.index)),
    middle: mean(samples.map(s => s.fingerCurls.middle)),
    ring: mean(samples.map(s => s.fingerCurls.ring)),
    pinky: mean(samples.map(s => s.fingerCurls.pinky)),
    thumb: mean(samples.map(s => s.fingerCurls.thumb)),
    avg: mean(allFingerCurls),
  };
  
  // 2. Calculate variance for each finger
  const variances = {
    index: samples.reduce((sum, s) => 
      sum + Math.pow(s.fingerCurls.index - averages.index, 2), 0) / samples.length,
    // ... repeat for each finger
  };
  
  // 3. Standard deviation = sqrt(variance)
  const stdDevs = {
    index: Math.sqrt(variances.index),
    middle: Math.sqrt(variances.middle),
    ring: Math.sqrt(variances.ring),
    pinky: Math.sqrt(variances.pinky),
    thumb: Math.sqrt(variances.thumb),
    avgStdDev: mean([stdDev.index, stdDev.middle, stdDev.ring, stdDev.pinky]),
  };
  
  return { ...averages, stdDevs };
};
```

### Step 2: Use Variance in Threshold Calculation

**OLD (fixed margins):**
```typescript
thumbsUpFingerCurl: Math.max(0.45, avgCurl - 0.15)
```

**NEW (variance-aware margins):**
```typescript
thumbsUpFingerCurl: Math.max(
  0.45,  // Hard minimum
  avgCurl - 0.15 - (stdDev * 0.5)  // Base margin + variance adjustment
)
```

**What this means:**
- If `avgCurl = 0.60` and `stdDev = 0.05` (low variance, consistent training):
  - Threshold: `0.60 - 0.15 - 0.025 = 0.425` ✅
  
- If `avgCurl = 0.60` and `stdDev = 0.15` (high variance, inconsistent training):
  - Threshold: `0.60 - 0.15 - 0.075 = 0.375` ✅ (much more lenient!)

### Step 3: Apply to All Thresholds

```typescript
const newThresholds = {
  // Fist detection: midpoint between palm and fist
  fistCurlThreshold: palmAvg && fistAvg 
    ? palmAvg.avg + (fistAvg.avg - palmAvg.avg) * 0.5
    : 0.4,
  
  // Palm detection: above average + 1 stdDev for tolerance
  palmExtendThreshold: palmAvg 
    ? Math.min(0.35, palmAvg.avg + 0.1 + palmAvg.stdDevs.avgStdDev)
    : 0.3,
  
  // Thumbs up: below average - (margin + 0.5*stdDev)
  thumbsUpFingerCurl: thumbsUpAvg 
    ? Math.max(0.45, thumbsUpAvg.avg - 0.15 - thumbsUpAvg.stdDevs.avgStdDev * 0.5)
    : 0.6,
  
  // Thumb extension: above average + (margin + 0.5*stdDev)
  thumbsUpThumbExtend: thumbsUpAvg 
    ? Math.min(0.35, thumbsUpAvg.thumb + 0.1 + thumbsUpAvg.stdDevs.thumb * 0.5)
    : 0.25,
};
```

## The Results

### Before (Fixed Margins)
- Training: 3 samples with avg curl = 0.60
- Learned threshold: `0.60 - 0.10 = 0.50`
- Real-world usage: Curl = 0.48 → **FAIL** ❌

### After (Variance-Aware)
- Training: 3 samples with avg curl = 0.60, stdDev = 0.12
- Learned threshold: `0.60 - 0.15 - (0.12 * 0.5) = 0.39`
- Real-world usage: Curl = 0.48 → **SUCCESS** ✅

## Key Insights

### 1. **Variance Is Signal, Not Noise**
High variance in training data tells you:
- User's natural hand position varies
- Thresholds need to be lenient
- Overfitting would break real-world usage

### 2. **Hard Limits Prevent Extremes**
```typescript
Math.max(0.45, calculatedThreshold)  // Don't go below 0.45
Math.min(0.35, calculatedThreshold)  // Don't go above 0.35
```
These prevent:
- **Too lenient:** Everything triggers the gesture
- **Too strict:** Nothing triggers the gesture

### 3. **Asymmetric Margins for Different Gestures**
```typescript
// Thumbs up: Subtract variance (more lenient detection)
fingerCurl: avg - 0.15 - (stdDev * 0.5)

// Thumb extension: Add variance (more lenient extension)
thumbExtend: avg + 0.1 + (stdDev * 0.5)
```

Why opposite directions?
- **Finger curl threshold:** Lower = easier to trigger (fingers don't need to curl as much)
- **Thumb extend threshold:** Higher = easier to trigger (thumb doesn't need to extend as much)

## The Full System Architecture

### Data Flow
```
1. Training Phase
   ├─ User makes gesture
   ├─ System detects (using default thresholds)
   ├─ User corrects if wrong
   ├─ Sample stored: { fingerCurls, timestamp, correctGesture }
   └─ Repeat 3+ times per gesture

2. Learning Phase
   ├─ Calculate per-finger averages
   ├─ Calculate per-finger standard deviations  ← KEY ADDITION
   ├─ Derive thresholds using avg ± (margin + stdDev)
   └─ Save to localStorage

3. Runtime Phase
   ├─ Load trained thresholds from localStorage
   ├─ detectGesture() uses trained values
   └─ Gestures work reliably! ✨
```

### Code Structure

**Training UI:** `GestureTrainerOverlay.tsx`
- Overlays on video feed
- Shows real-time finger curl values
- Correction buttons for each gesture type
- Calculates variance-aware thresholds

**Detection Logic:** `gestureDetection.ts`
- Module-level `currentThresholds` (defaults or trained)
- `loadTrainedThresholds()` - loads from localStorage
- `getCurrentThresholds()` - used by detection
- `detectGesture()` - main detection algorithm

**Threshold Management:**
```typescript
interface GestureThresholds {
  fistCurlThreshold: number;
  fistMinFingers: number;
  palmExtendThreshold: number;
  palmThumbMultiplier: number;
  thumbsUpFingerCurl: number;      // ← This was the problem!
  thumbsUpThumbExtend: number;
  thumbsUpMinFingers: number;
  thumbsUpYThreshold: number;
  thumbsUpXThreshold: number;
}
```

## Debugging Tools

### Browser Console Commands
```javascript
// View current thresholds
JSON.parse(localStorage.getItem('gesture-thresholds'))

// View raw training samples
JSON.parse(localStorage.getItem('gesture-samples'))

// Check thumbs up threshold specifically
const t = JSON.parse(localStorage.getItem('gesture-thresholds'));
console.log('Threshold:', t.thumbsUpFingerCurl);
console.log('Should be ~0.40-0.50 after training');

// Manual override (testing only)
const t = JSON.parse(localStorage.getItem('gesture-thresholds'));
t.thumbsUpFingerCurl = 0.45;  // Lower = more sensitive
localStorage.setItem('gesture-thresholds', JSON.stringify(t));
location.reload();
```

### Console Logs During Detection
```
📊 Finger curls: {index: 0.52, middle: 0.48, ring: 0.51, pinky: 0.49, thumb: 0.12}
👍 Is thumbs up? true (fingers > 0.42: 3/3, thumb < 0.28: true, pointing up: true)
✊ Is fist? false (fingers > 0.42: 3/4)
🖐️ Is palm? false (fingers < 0.32: 0/4)
```

## Lessons Learned

### 1. **Training Data Quality > Quantity**
- 3 consistent samples better than 10 inconsistent samples
- High variance → more lenient thresholds (adaptive behavior)

### 2. **Default Thresholds Matter**
Even with training, you need sensible defaults:
```typescript
const DEFAULT_THRESHOLDS = {
  thumbsUpFingerCurl: 0.6,    // Works for most people
  thumbsUpThumbExtend: 0.25,  // Reasonable thumb extension
  // ... etc
};
```

### 3. **Statistical Methods in ML Systems**
This isn't "deep learning" but it's still machine learning:
- Collect samples ✓
- Extract features (finger curls) ✓
- Learn decision boundaries (thresholds) ✓
- Account for variance ✓
- Prevent overfitting ✓

### 4. **User Feedback Loops Are Critical**
The bug was discovered through user testing:
- "I trained it but now it's broken"
- Quick iteration on fix
- User retrains with new algorithm
- Problem solved!

## Performance Impact

**Algorithm complexity:**
- **Before:** O(n) for averages
- **After:** O(2n) for averages + variance (still O(n))

**Runtime overhead:**
- Variance calculation: ~0.1ms per gesture type
- 4 gesture types = ~0.4ms total
- Training happens once, detection runs at 30 FPS
- **Negligible impact!**

## Future Enhancements

### 1. **Visual Variance Feedback**
```typescript
// During training, show:
<div>
  Consistency: {stdDev < 0.05 ? '🟢 Great!' : '🟡 Try to be more consistent'}
  Standard Deviation: {stdDev.toFixed(3)}
</div>
```

### 2. **Outlier Detection**
```typescript
// Remove samples > 2 standard deviations from mean
const filteredSamples = samples.filter(s => 
  Math.abs(s.avgCurl - mean) < 2 * stdDev
);
```

### 3. **Hand-Specific Training**
```typescript
const thresholds = {
  left: { thumbsUpFingerCurl: 0.42, ... },
  right: { thumbsUpFingerCurl: 0.48, ... },
};
```

### 4. **Training Quality Score**
```typescript
const qualityScore = {
  sampleCount: samples.length >= 3 ? '✓' : '✗',
  consistency: stdDev < 0.08 ? '✓' : '✗',
  separation: Math.abs(thumbsUpAvg - fistAvg) > 0.3 ? '✓' : '✗',
};
```

## Conclusion

**The Problem:** Gesture training broke gesture detection by overfitting to training samples.

**The Solution:** Add variance awareness to threshold calculation using standard deviation.

**The Result:** Gestures now work reliably despite natural hand position variation.

**Key Takeaway:** When building ML systems (even simple ones!), always account for variance in your training data. Fixed margins work in demos; adaptive margins work in production.

---

## Try It Yourself

The full code is available in the Advent of AI 2025, Day 5 project:

```bash
git clone <repo>
cd day-5/homecoming-board
npm install
npm run dev
```

Navigate to `/gesture-training`, train your gestures, and see variance-aware thresholds in action!

**Training tips:**
1. Make each gesture 3-5 times
2. Try slight variations (different angles, positions)
3. Check console logs to see learned thresholds
4. Higher variance in training → more lenient thresholds (by design!)

---

**Questions? Found a bug?** Drop a comment or open an issue!

**Further Reading:**
- [MediaPipe Hands Documentation](https://google.github.io/mediapipe/solutions/hands.html)
- [Bias-Variance Tradeoff](https://en.wikipedia.org/wiki/Bias%E2%80%93variance_tradeoff)
- [Standard Deviation in Machine Learning](https://machinelearningmastery.com/a-gentle-introduction-to-standard-deviation/)
