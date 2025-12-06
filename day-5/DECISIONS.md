# Key Decisions for Homecoming Board

## 🤔 Decisions to Make Before Starting Development

### 1. Gesture Selection (Required)

**Recommended**: Closed Fist + Open Palm
- **Why**: These are the MOST distinct hand shapes
- **Pros**: 
  - Easy to distinguish algorithmically
  - Natural, intuitive movements
  - Low false positive rate
- **Actions**:
  - Closed Fist = Scroll/Navigate through flights
  - Open Palm = Select/Expand flight details

**Alternative Options**:
- Thumbs Up + Peace Sign (good but slightly harder to detect)
- Swipe Left + Swipe Right (requires motion tracking)
- Point + Wave (pointing can be confused with fist)

**Your Choice**: ________________

---

### 2. Flight Data API (Required)

**Recommended**: OpenSky Network
- **URL**: https://opensky-network.org/api
- **Why**: Completely free, no API key, real-time data
- **Pros**:
  - No registration required
  - Real aircraft positions
  - Active community
- **Cons**:
  - Needs CORS proxy
  - 10-second rate limit (anonymous)
  - Less detailed flight info
- **Best Endpoint**: `/states/all` for live positions

**Alternative**: AviationStack
- **URL**: https://aviationstack.com/
- **Why**: Rich flight data, official API
- **Pros**:
  - Detailed flight information
  - Arrival/departure times
  - Airline details
- **Cons**:
  - Requires API key
  - Only 500 requests/month (free tier)
  - Limited free tier

**Your Choice**: ________________

---

### 3. Styling Approach (Required)

**Recommended**: Tailwind CSS
- **Why**: Rapid development, utility-first, great for prototyping
- **Pros**:
  - Fast to implement
  - Consistent design system
  - Easy responsive design
  - Great for winter theme with custom colors
- **Setup**: `npm install -D tailwindcss postcss autoprefixer`

**Alternative**: Pure CSS/CSS Modules
- **Why**: No dependencies, full control
- **Pros**:
  - Lighter bundle
  - No learning curve
  - Complete flexibility
- **Cons**:
  - More verbose
  - Slower development

**Your Choice**: ________________

---

### 4. Target Airport (Required)

**Recommendations**:
- **JFK (New York)** - John F. Kennedy International
  - ICAO: KJFK
  - Busiest, most flights, good for demo
  
- **LAX (Los Angeles)** - Los Angeles International
  - ICAO: KLAX
  - West coast, high traffic
  
- **ORD (Chicago)** - O'Hare International
  - ICAO: KORD
  - Central location, major hub

- **ATL (Atlanta)** - Hartsfield-Jackson Atlanta
  - ICAO: KATL
  - World's busiest airport

**Your Choice**: ________________
**ICAO Code**: ________________

---

## 🎨 Design Decisions

### Winter Color Palette
**Option 1: Classic Winter**
- Primary: Deep Blue (#1E3A8A)
- Secondary: Ice Blue (#93C5FD)
- Accent: Gold (#FCD34D)
- Background: White to Gray (#F8FAFC to #E2E8F0)

**Option 2: Festive Holiday**
- Primary: Forest Green (#166534)
- Secondary: Cranberry Red (#DC2626)
- Accent: Gold (#F59E0B)
- Background: Cream (#FFFBEB)

**Your Choice**: ________________

---

## 🔧 Technical Decisions

### CORS Proxy
**Recommended**: https://corsproxy.io/?
- Simple, works out of the box
- Format: `https://corsproxy.io/?https://api.example.com`

**Alternative**: Netlify Functions
- Create serverless function
- More control, no third-party dependency
- Requires more setup

**Your Choice**: ________________

---

## 📱 Scope Decisions

### Starting Scope (MVP)
- ✅ Single airport
- ✅ 2 gestures
- ✅ Arrivals only
- ✅ Desktop only
- ✅ Single user

### Bonus Features Priority (pick 1-2 to start)
- [ ] 3rd gesture type
- [ ] Multiple airports
- [ ] Departures + Arrivals
- [ ] Mobile responsive
- [ ] Two-handed gestures
- [ ] Sound effects
- [ ] Voice feedback
- [ ] PartyKit multi-user

**Your Bonus Picks**: ________________

---

## ✅ Quick Start Checklist

Once decisions are made:
1. [ ] Create Vite project: `npm create vite@latest homecoming-board -- --template react-ts`
2. [ ] Install dependencies
3. [ ] If Tailwind: Run `npx tailwindcss init -p`
4. [ ] Set up project folders
5. [ ] Create .env for API keys (if needed)
6. [ ] Start development server: `npm run dev`

---

## 📋 Copy Your Choices Here

```
Gestures: ________________
Flight API: ________________
Styling: ________________
Airport: ________________ (ICAO: ________)
Color Palette: ________________
CORS Proxy: ________________
Bonus Features: ________________
```

Ready to start building? Let's create the Vite project! 🚀
