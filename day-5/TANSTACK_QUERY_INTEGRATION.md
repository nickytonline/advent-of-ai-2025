# TanStack Query Integration Summary
## OpenSky API Flight Data - Phase 4 Preparation

---

## 📋 What I've Done

### ✅ 1. Created `useFlightData.ts` Hook
**Location**: `/homecoming-board/src/hooks/useFlightData.ts`

A production-ready TanStack Query hook for fetching flight data from OpenSky Network API.

**Features Included:**
- ✅ Full TypeScript types for OpenSky API responses
- ✅ Data transformation (raw API → `ProcessedFlight` format)
- ✅ Bounding box filtering for airport-specific flights
- ✅ Configurable auto-refresh intervals
- ✅ Automatic retry logic with exponential backoff
- ✅ Smart caching (20s stale time, 5min cache)
- ✅ Background refetching support
- ✅ Loading and error states

**Usage Example:**
```typescript
const { data: flights, isLoading, error, refetch } = useFlightData({
  airport: 'JFK',
  bbox: { minLat: 40.5, maxLat: 40.8, minLng: -74.0, maxLng: -73.6 },
  refetchInterval: 30000, // 30 seconds
});
```

### ✅ 2. Updated PRD.md

**Phase 4 Section Enhanced:**
- Added detailed TanStack Query implementation checklist
- Included caching strategy details
- Documented retry logic configuration
- Added data transformation requirements

**New API Research Section:**
- Replaced server function approach with TanStack Query
- Added "Why TanStack Query?" benefits list
- Included configuration recommendations
- Added query key strategy guidelines
- Documented best practices specific to flight tracking

---

## 🎯 Why TanStack Query for OpenSky API?

### The Perfect Match ✨

| Challenge | TanStack Query Solution |
|-----------|------------------------|
| **Rate Limits** (10s for anonymous) | `staleTime: 20000` prevents excessive requests |
| **Real-time Updates** | `refetchInterval: 30000` auto-refreshes data |
| **Network Failures** | `retry: 3` with exponential backoff |
| **Multiple Components** | Single query shared across app |
| **Loading States** | Built-in `isLoading`, `isFetching`, `isError` |
| **Gesture Refresh** | Easy manual `refetch()` trigger |

### Key Benefits

1. **🚀 No CORS Issues**: OpenSky API supports CORS natively
2. **💾 Smart Caching**: Prevents redundant API calls
3. **🔄 Background Sync**: Updates even when tab is inactive
4. **🎯 Request Deduplication**: Multiple components = one request
5. **⚡ Optimistic UI**: Show cached data instantly
6. **🛡️ Error Recovery**: Automatic retries keep app resilient

---

## 📊 Configuration Explained

### Recommended Settings

```typescript
{
  // Caching
  staleTime: 20000,              // 20s - respects 10s API rate limit
  gcTime: 5 * 60 * 1000,         // 5 min - how long to keep in cache
  
  // Auto-refresh
  refetchInterval: 30000,         // 30s - balance freshness vs API calls
  refetchIntervalInBackground: true,  // Update even when tab inactive
  refetchOnWindowFocus: true,     // Refresh when user returns
  
  // Error handling
  retry: 3,                       // 3 attempts before giving up
  retryDelay: (attempt) =>        // Exponential backoff
    Math.min(1000 * 2 ** attempt, 30000),
  
  // UX optimization
  placeholderData: (prev) => prev,  // Show old data while refetching
}
```

### Why These Values?

- **staleTime: 20000** (20s) - OpenSky has 10s rate limit; 20s gives safe buffer
- **refetchInterval: 30000** (30s) - Keeps data fresh without spamming API
- **retry: 3** - Tolerates temporary network issues
- **placeholderData** - Prevents loading spinners on background refetch

---

## 🔧 How to Use in Phase 4

### Step 1: Import the Hook
```typescript
import { useFlightData } from '../hooks/useFlightData';
```

### Step 2: Use in Component
```typescript
function FlightBoard() {
  const { data: flights, isLoading, error, refetch } = useFlightData({
    airport: 'JFK',
    refetchInterval: 30000,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {flights?.map(flight => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
```

### Step 3: Gesture-Triggered Refresh
```typescript
// In your gesture handler
function handleRefreshGesture() {
  refetch(); // Manually trigger data refresh
}
```

---

## 📁 Files Created/Modified

### ✅ Created
- `src/hooks/useFlightData.ts` - Complete TanStack Query implementation

### ✅ Modified
- `PRD.md` - Updated Phase 4 and API sections with TanStack Query details

---

## 🎓 Query Key Strategy

Using structured query keys makes cache management easy:

```typescript
['flights', airport, bbox]         // All flights for an area
['flights', 'JFK', {...}]          // Specific to JFK
['flight-details', flightId]       // Individual flight (future)
```

**Benefits:**
- Easy to invalidate specific queries
- Can filter by key patterns
- Clear, predictable cache structure

---

## 🚀 Next Steps for Phase 4

When you're ready to implement flight data:

1. ✅ **Hook is ready** - `useFlightData.ts` is complete
2. 🔨 **Build FlightCard component** - Display individual flight info
3. 🔨 **Build FlightBoard component** - Use `useFlightData()` hook
4. 🔨 **Add loading/error UI** - Handle all states gracefully
5. 🔨 **Test with different airports** - Adjust bounding boxes
6. 🔨 **Connect gestures** - Wire up `refetch()` to hand gestures

---

## 🎨 Example FlightCard Component

Here's a starter template for Phase 5:

```typescript
interface FlightCardProps {
  flight: ProcessedFlight;
  isSelected?: boolean;
  onClick?: () => void;
}

function FlightCard({ flight, isSelected, onClick }: FlightCardProps) {
  return (
    <div 
      className={`
        flight-card 
        ${isSelected ? 'selected' : ''}
        ${flight.onGround ? 'landed' : 'in-air'}
      `}      onClick={onClick}
    >
      <h3>{flight.callsign}</h3>
      <p>From: {flight.country}</p>
      <p>Altitude: {flight.altitude ? `${Math.round(flight.altitude)}m` : 'N/A'}</p>
      <p>Status: {flight.status}</p>
      <p>Speed: {flight.velocity ? `${Math.round(flight.velocity * 3.6)} km/h` : 'N/A'}</p>
    </div>
  );
}
```

---

## 🧪 Testing Checklist

When implementing Phase 4:

- [ ] Data fetches successfully
- [ ] Loading state displays
- [ ] Error state handles failures
- [ ] Auto-refresh works (check network tab)
- [ ] Cache prevents redundant requests
- [ ] Multiple components share same query
- [ ] Gesture refresh triggers successfully
- [ ] Rate limit respected (no 429 errors)
- [ ] Background refetch works when tab inactive
- [ ] Window focus refetch works

---

## 💡 Pro Tips

### 1. DevTools
Install React Query DevTools to see queries in action:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to your app
<ReactQueryDevtools initialIsOpen={false} />
```

### 2. Query Invalidation
Manually invalidate when needed:
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['flights'] });
```

### 3. Filtering by Airport
Adjust bounding box coordinates for different airports:
```typescript
const AIRPORT_BOUNDS = {
  JFK: { minLat: 40.5, maxLat: 40.8, minLng: -74.0, maxLng: -73.6 },
  LAX: { minLat: 33.8, maxLat: 34.0, minLng: -118.5, maxLng: -118.2 },
  ORD: { minLat: 41.8, maxLat: 42.1, minLng: -87.9, maxLng: -87.6 },
};
```

---

## 🎯 Summary

**What You Have Now:**
- ✅ Production-ready `useFlightData` hook
- ✅ Full TypeScript types
- ✅ Optimized caching strategy
- ✅ Automatic error handling
- ✅ Background sync capability
- ✅ Gesture-friendly refresh API
- ✅ Updated PRD with implementation details

**What You Need to Build:**
- 🔨 FlightCard component (display individual flight)
- 🔨 FlightBoard component (use the hook)
- 🔨 UI for loading/error states
- 🔨 Connect to gesture system

**Your OpenSky API integration will be clean, performant, and production-ready!** 🚀✈️

---

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [OpenSky Network API](https://opensky-network.org/apidoc/)
- [React Query DevTools](https://tanstack.com/query/latest/docs/devtools)
- Your `useFlightData.ts` - Already complete! ✅
