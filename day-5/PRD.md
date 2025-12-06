# The Homecoming Board - PRD
## Day 5: Gesture-Controlled Flight Tracker ✈️❄️🧤

---

## 🎯 Project Vision

Build a magical, touchless flight arrival display for the Winter Festival entrance. Visitors wearing gloves and mittens can control the display using only hand gestures - no touching screens in the freezing cold!

**The Magic**: Real-time hand tracking AI (MediaPipe) running 30-60 FPS in the browser, combined with live flight data, creates a seamless touchless experience.

---

## 📋 Core Requirements

### Must Have Features

#### ✈️ Flight Data Integration
- [ ] Display real flight arrival data from at least one airport
- [ ] Show flight information:
  - [ ] Flight number
  - [ ] Origin city/airport
  - [ ] ETA (Estimated Time of Arrival)
  - [ ] Airline name
  - [ ] Flight status
- [ ] Use real flight API (OpenSky Network or AviationStack)
- [ ] Handle API rate limits with caching
- [ ] Set up CORS proxy for browser requests

#### 👋 Gesture Control System
- [ ] Implement at least 2 distinct gesture types:
  - [ ] **Option 1**: Closed fist + Open palm (recommended - very distinct)
  - [ ] **Option 2**: Thumbs up + Peace sign
  - [ ] **Option 3**: Swipe left/right + Point
- [ ] Define gesture actions:
  - [ ] Navigate between flights (scroll/swipe)
  - [ ] Select/highlight flight for details (point/tap)
  - [ ] Refresh data (optional)
- [ ] Debounce gestures (200-400ms for snappiness)
- [ ] Visual feedback when gesture detected

#### 📸 Hand Tracking
- [ ] Integrate MediaPipe Hands solution
- [ ] Access webcam feed
- [ ] Display video feed (mirrored)
- [ ] Track hand landmarks in real-time
- [ ] Set detection confidence to 0.7 (tunable)
- [ ] Mirror both video AND landmarks together
- [ ] Handle tracking loss gracefully

#### 🎄 Winter/Holiday UI
- [ ] Winter/holiday themed color scheme
- [ ] Snow effects or winter animations
- [ ] Festive typography and icons
- [ ] "Welcome Home" messaging
- [ ] Clean, readable flight information cards
- [ ] Responsive layout
- [ ] High contrast for outdoor viewing

#### 💫 User Feedback
- [ ] Visual indicator when hand is detected
- [ ] Gesture recognition feedback (highlight, glow, animation)
- [ ] Loading states
- [ ] Error messages (webcam denied, API failure)
- [ ] Hand skeleton overlay (optional)

---

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: TanStack Start (React + TypeScript with SSR)
  - **Why TanStack Start**: Built-in server-side capabilities prevent CORS issues with flight APIs
  - Server functions can proxy API requests without needing external CORS proxies
- **Hand Tracking**: MediaPipe Hands (JavaScript SDK)
- **Flight API**: OpenSky Network (free) or AviationStack (free tier)
- **Styling**: CSS3 + CSS Animations (or Tailwind CSS)
- **Real-time Multi-user (Bonus)**: PartyKit
- **Deployment**: Netlify

### Project Structure
```
homecoming-board/
├── src/
│   ├── components/
│   │   ├── WebcamFeed.tsx          # Webcam video display
│   │   ├── HandTracker.tsx         # MediaPipe integration
│   │   ├── GestureDetector.tsx     # Gesture recognition logic
│   │   ├── FlightBoard.tsx         # Main flight display
│   │   ├── FlightCard.tsx          # Individual flight info
│   │   ├── GestureIndicator.tsx    # Visual feedback for gestures
│   │   └── WinterTheme.tsx         # Snow effects, decorations
│   ├── hooks/
│   │   ├── useMediaPipe.ts         # MediaPipe setup hook
│   │   ├── useGestures.ts          # Gesture detection hook
│   │   ├── useFlightData.ts        # Flight API hook
│   │   └── useWebcam.ts            # Webcam access hook
│   ├── services/
│   │   ├── flightAPI.ts            # Flight API client
│   │   ├── gestureRecognizer.ts    # Gesture logic
│   │   └── corsProxy.ts            # CORS proxy helper
│   ├── types/
│   │   ├── flight.ts               # Flight data types
│   │   └── gesture.ts              # Gesture types
│   ├── utils/
│   │   ├── handLandmarks.ts        # Hand landmark helpers
│   │   └── debounce.ts             # Debounce utility
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎨 Design Specifications

### Color Palette (Winter Theme)
- **Primary**: Deep blue (#1E3A8A) - night sky
- **Secondary**: Ice blue (#93C5FD) - frost
- **Accent**: Gold (#FCD34D) - warm lights
- **Background**: White to light gray gradient (#F8FAFC to #E2E8F0)
- **Text**: Dark blue (#1E293B) for contrast

### Typography
- **Headers**: Bold, sans-serif (Inter, Poppins)
- **Flight Info**: Monospace for flight numbers (Roboto Mono)
- **Body**: Clean sans-serif

### Animations
- Gentle snow falling in background
- Smooth card transitions
- Gesture feedback animations (pulse, glow)
- Flight card hover effects

---

## 🔄 User Flow

1. **Landing**
   - User arrives at page
   - Webcam permission requested
   - Instructions shown: "Use hand gestures to control"

2. **Hand Detection**
   - User shows hand to camera
   - Green outline appears around detected hand
   - Gesture guide shown (visual reference)

3. **Browsing Flights**
   - User performs "scroll" gesture (e.g., swipe hand left/right)
   - Flight cards slide smoothly
   - Visual feedback confirms gesture

4. **Selecting Flight**
   - User performs "select" gesture (e.g., open palm or point)
   - Selected flight card expands with more details
   - Background slightly blurred for focus

5. **Continuous Operation**
   - Auto-refresh flight data every 30-60 seconds
   - Smooth, magical experience
   - No touching required!

---

## 🚀 Development Phases

### Phase 1: Project Setup ✅
- [x] MediaPipe installed and tested
- [x] Create TanStack Start project
- [x] Project structure set up
- [ ] Install additional dependencies:
  - [ ] MediaPipe (@mediapipe/hands)
  - [ ] React webcam or custom webcam hook
- [ ] Configure TypeScript (if needed)

### Phase 2: Hand Tracking Foundation
- [ ] Implement webcam access
- [ ] Integrate MediaPipe Hands
- [ ] Display video feed (mirrored)
- [ ] Draw hand landmarks on canvas overlay
- [ ] Verify tracking works smoothly (30+ FPS)
- [ ] Add error handling (no webcam, permission denied)

### Phase 3: Gesture Recognition
- [ ] Define gesture types (choose 2 distinct gestures)
- [ ] Implement gesture detection logic:
  - [ ] Analyze hand landmarks
  - [ ] Detect gesture patterns
  - [ ] Add confidence thresholds
- [ ] Add debouncing (200-400ms)
- [ ] Test gesture reliability
- [ ] Add visual feedback for recognized gestures

### Phase 4: Flight Data Integration
- [ ] Research flight APIs (OpenSky Network recommended)
- [ ] Set up API client with CORS proxy
- [ ] Fetch flight arrival data
- [ ] Parse and format flight data
- [ ] Implement caching to respect rate limits
- [ ] Add auto-refresh (30-60s intervals)
- [ ] Handle API errors gracefully

### Phase 5: UI/UX Development
- [ ] Design flight card component
- [ ] Build flight board layout
- [ ] Implement gesture-driven navigation
- [ ] Add winter/holiday theme styling
- [ ] Create snow/winter effects
- [ ] Add animations and transitions
- [ ] Implement responsive design

### Phase 6: Integration & Polish
- [ ] Connect gestures to flight board navigation
- [ ] Fine-tune gesture sensitivity
- [ ] Optimize performance
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Add user instructions/tutorial
- [ ] Test across different browsers
- [ ] Polish animations and transitions

### Phase 7: Testing & Refinement
- [ ] Test gesture accuracy
- [ ] Test with different lighting conditions
- [ ] Test with different hand sizes/skin tones
- [ ] Verify flight data accuracy
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Accessibility considerations

### Phase 8: Deployment
- [ ] Build production bundle
- [ ] Deploy to Netlify
- [ ] Test deployed version
- [ ] Share with users
- [ ] Gather feedback

---

## 🎁 Bonus Features (Optional)

### 🌟 Beginner Bonus
- [ ] Add 3rd gesture type
- [ ] Show departures in addition to arrivals
- [ ] Add sound effects for gestures
- [ ] Display hand skeleton overlay
- [ ] Add gesture confidence meter

### 🌟🌟 Intermediate Bonus
- [ ] Support multiple airports (switch with gestures)
- [ ] Two-handed gestures (both hands required)
- [ ] Voice feedback using Web Speech API
- [ ] Smooth gesture-based animations
- [ ] Add flight delay indicators
- [ ] Weather information per flight

### 🌟🌟🌟 Advanced Bonus
- [ ] Build gesture training mode (custom gestures)
- [ ] Add pose detection (full body control)
- [ ] AR elements overlaid on video feed
- [ ] Historical flight data and analytics
- [ ] Multiple airport terminals support
- [ ] Save favorite flights

### 🌟🌟🌟🌟 Ultimate Challenge
- [ ] Multi-user support with PartyKit
  - [ ] Multiple people can control simultaneously
  - [ ] Collaborative gesture voting
  - [ ] Real-time sync across devices
- [ ] ML that learns gesture preferences
- [ ] Mobile app version (React Native)
- [ ] Analytics dashboard (gesture usage, popular flights)
- [ ] Admin panel for airport configuration

---

## 📚 API Research & Setup

### Flight Data APIs

#### Option 1: OpenSky Network (Recommended - Free)
- **Endpoint**: `https://opensky-network.org/api/states/all`
- **Rate Limit**: Anonymous (10s interval), Registered (5s interval)
- **Data**: Live aircraft positions, registration, origin, destination
- **Pros**: Completely free, no API key needed
- **Cons**: Rate limits (mitigated with caching)
- **Setup with TanStack Start Server Function**: 
  ```typescript
  // No CORS proxy needed! TanStack Start server functions handle this
  import { createServerFn } from '@tanstack/start'
  
  export const getFlights = createServerFn('GET', async () => {
    const response = await fetch('https://opensky-network.org/api/states/all')
    return response.json()
  })
  ```

#### Option 2: AviationStack (Free Tier)
- **Endpoint**: `http://api.aviationstack.com/v1/flights`
- **Rate Limit**: 500 requests/month (free tier)
- **Data**: Flight status, arrival/departure times, airline info
- **Pros**: Rich data, official API
- **Cons**: Limited free tier, requires API key
- **Setup**:
  ```typescript
  const API_KEY = 'your_key_here';
  const API_URL = 'http://api.aviationstack.com/v1/flights';
  ```

### CORS Proxy Options (Not Needed with TanStack Start!)
Since TanStack Start includes server-side capabilities, we don't need external CORS proxies. Server functions run on the backend and can make direct API requests without CORS restrictions.

**If you were using a pure client-side approach**, you would need:
- `https://corsproxy.io/?`
- `https://api.allorigins.win/raw?url=`
- Custom Netlify Functions

---

## 🎓 MediaPipe Tips & Best Practices

### Hand Tracking Configuration
```typescript
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 2,              // Track up to 2 hands
  modelComplexity: 1,          // 0=lite, 1=full (balance performance)
  minDetectionConfidence: 0.7, // Tune this for reliability
  minTrackingConfidence: 0.5,  // Lower = more forgiving tracking
});
```

### Mirroring Video & Landmarks
```typescript
// Mirror the video
<video style={{ transform: 'scaleX(-1)' }} />

// Mirror the landmarks
const mirroredX = 1 - landmark.x;
```

### Gesture Detection Pattern
```typescript
// Example: Detect closed fist
function isClosedFist(landmarks) {
  // Check if fingertips are close to palm
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const palmBase = landmarks[0];
  
  // Calculate distances
  const distance = calculateDistance(indexTip, palmBase);
  
  return distance < THRESHOLD;
}
```

---

## ⚠️ Known Challenges & Solutions

### Challenge 1: Mirror Image Confusion
**Problem**: Hand appears on wrong side, landmarks don't match  
**Solution**: Mirror BOTH video AND landmarks together, consistently

### Challenge 2: Gesture False Positives
**Problem**: Similar gestures get confused  
**Solution**: Choose very distinct gestures, add debouncing, tune confidence

### Challenge 3: CORS Errors with Flight API ✅ SOLVED
**Problem**: Browser blocks direct API requests from client-side code  
**Solution**: TanStack Start's server functions run on the server, eliminating CORS issues entirely. No external CORS proxy needed!

### Challenge 4: Poor Hand Detection
**Problem**: Lighting, background, hand position affects tracking  
**Solution**: 
- Suggest good lighting to users
- Adjust detection confidence
- Show visual guide for hand positioning

### Challenge 5: Performance Issues
**Problem**: High CPU usage, dropped frames  
**Solution**:
- Use `modelComplexity: 0` for lighter model
- Reduce video resolution
- Throttle gesture checks
- Use requestAnimationFrame efficiently

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Webcam access works
- [ ] Hand tracking active and smooth
- [ ] All gestures reliably detected
- [ ] Flight data loads correctly
- [ ] Gesture navigation works
- [ ] Auto-refresh works
- [ ] Error states handled

### Performance Testing
- [ ] 30+ FPS hand tracking
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Fast initial load

### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (bonus)

### Environment Testing
- [ ] Good lighting conditions
- [ ] Low lighting conditions
- [ ] Different backgrounds
- [ ] Different distances from camera
- [ ] Different hand sizes
- [ ] Different skin tones

---

## 📖 Documentation Needs

- [ ] README with setup instructions
- [ ] Gesture guide (how to perform each gesture)
- [ ] API setup guide
- [ ] Deployment guide
- [ ] Troubleshooting section
- [ ] Demo video/GIF

---

## 🎯 Success Metrics

### Technical Success
- ✅ Hand tracking runs at 30+ FPS
- ✅ Gesture recognition >90% accuracy
- ✅ Real flight data displayed
- ✅ Works in major browsers
- ✅ Deployed and accessible

### User Experience Success
- ✅ Magical, delightful experience
- ✅ Clear visual feedback
- ✅ No confusion about how to use
- ✅ Smooth, responsive interactions
- ✅ Winter festival atmosphere

---

## 📅 Timeline Estimate

- **Phase 1-2**: 2-3 hours (Setup + Hand Tracking)
- **Phase 3**: 2-3 hours (Gesture Recognition)
- **Phase 4**: 1-2 hours (Flight API)
- **Phase 5**: 3-4 hours (UI/UX)
- **Phase 6-7**: 2-3 hours (Integration + Testing)
- **Phase 8**: 1 hour (Deployment)

**Total**: 11-16 hours for core features

---

## 🔗 Resources

### Documentation
- [MediaPipe Hands Guide](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [MediaPipe Hands JS](https://www.npmjs.com/package/@mediapipe/hands)
- [OpenSky Network API](https://opensky-network.org/apidoc/)
- [AviationStack API](https://aviationstack.com/documentation)
- [PartyKit Docs](https://docs.partykit.io/)

### Examples & Inspiration
- MediaPipe hand tracking demos
- Gesture-controlled interfaces
- Flight tracker UIs

### Tools
- CORS Proxy: https://corsproxy.io/
- Hand Landmark Visualizer: Use test_mediapipe.py as reference

---

## 💡 Key Decisions to Make

1. **Which 2 gestures?**
   - Recommendation: Closed fist + Open palm (most distinct)

2. **Which flight API?**
   - Recommendation: OpenSky Network (free, no key needed)

3. **Single airport or multiple?**
   - Start with one major airport (JFK, LAX, ORD)
   - Add multi-airport in bonus phase

4. **Styling approach?**
   - Pure CSS vs Tailwind CSS
   - Recommendation: Tailwind for rapid development

5. **Multi-user from start or bonus?**
   - Start single-user, add PartyKit as bonus

---

## 🚦 Ready to Build!

Current Status:
- ✅ MediaPipe installed and verified
- ✅ PRD created and updated with TanStack Start
- ✅ TanStack Start project created (CORS issues solved!)
- ⏳ Next: Install MediaPipe and start building hand tracking

**Next Steps**: 
```bash
npm install @mediapipe/hands
# Then start implementing webcam and hand tracking!
```
