import { useQuery } from '@tanstack/react-query';

// Flight data types based on OpenSky Network API
export interface FlightData {
  icao24: string;           // Unique ICAO 24-bit address
  callsign: string | null;  // Flight callsign (e.g., "UAL123")
  origin_country: string;   // Country name
  time_position: number | null;
  last_contact: number;     // Unix timestamp of last update
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;  // Barometric altitude in meters
  on_ground: boolean;
  velocity: number | null;       // Speed in m/s
  true_track: number | null;     // Direction in degrees
  vertical_rate: number | null;  // m/s
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export interface OpenSkyResponse {
  time: number;
  states: Array<[
    string,  // icao24
    string | null,  // callsign
    string,  // origin_country
    number | null,  // time_position
    number,  // last_contact
    number | null,  // longitude
    number | null,  // latitude
    number | null,  // baro_altitude
    boolean,  // on_ground
    number | null,  // velocity
    number | null,  // true_track
    number | null,  // vertical_rate
    number[] | null,  // sensors
    number | null,  // geo_altitude
    string | null,  // squawk
    boolean,  // spi
    number  // position_source
  ]>;
}

export interface ProcessedFlight {
  id: string;
  callsign: string;
  country: string;
  lastContact: Date;
  position: {
    lat: number;
    lng: number;
  } | null;
  altitude: number | null;
  onGround: boolean;
  velocity: number | null;
  heading: number | null;
  status: 'arriving' | 'departed' | 'in-air' | 'on-ground';
}

// Bounding box for specific airport area (example: JFK Airport area)
// These coordinates define a box around JFK to filter relevant flights
const DEFAULT_BBOX = {
  minLat: 40.5,
  maxLat: 40.8,
  minLng: -74.0,
  maxLng: -73.6,
};

interface UseFlightDataOptions {
  airport?: string;
  bbox?: typeof DEFAULT_BBOX;
  refetchInterval?: number; // Auto-refetch interval in ms
  enabled?: boolean;
}

/**
 * Custom hook to fetch and manage flight data using TanStack Query
 * 
 * Features:
 * - Automatic caching
 * - Background refetching
 * - Error handling with retries
 * - Loading states
 * - Rate limit friendly with staleTime
 */
export function useFlightData(options: UseFlightDataOptions = {}) {
  const {
    airport = 'JFK',
    bbox = DEFAULT_BBOX,
    refetchInterval = 30000, // Default: 30 seconds
    enabled = true,
  } = options;

  return useQuery<ProcessedFlight[], Error>({
    queryKey: ['flights', airport, bbox],
    
    queryFn: async (): Promise<ProcessedFlight[]> => {
      console.log('🛫 Fetching flight data...');
      
      // OpenSky Network API endpoint with bounding box
      const url = new URL('https://opensky-network.org/api/states/all');
      url.searchParams.append('lamin', bbox.minLat.toString());
      url.searchParams.append('lamax', bbox.maxLat.toString());
      url.searchParams.append('lomin', bbox.minLng.toString());
      url.searchParams.append('lomax', bbox.maxLng.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`OpenSky API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenSkyResponse = await response.json();

      // Transform raw API data into our processed format
      const flights: ProcessedFlight[] = data.states
        .map((state) => {
          const [
            icao24,
            callsign,
            origin_country,
            time_position,
            last_contact,
            longitude,
            latitude,
            baro_altitude,
            on_ground,
            velocity,
            true_track,
          ] = state;

          return {
            id: icao24,
            callsign: callsign?.trim() || icao24,
            country: origin_country,
            lastContact: new Date(last_contact * 1000),
            position: latitude !== null && longitude !== null
              ? { lat: latitude, lng: longitude }
              : null,
            altitude: baro_altitude,
            onGround: on_ground,
            velocity,
            heading: true_track,
            status: (on_ground ? 'on-ground' : 'in-air') as 'on-ground' | 'in-air',
          };
        })
        // Filter out invalid flights
        .filter((flight) => flight.position !== null);

      console.log(`✅ Fetched ${flights.length} flights`);
      return flights;
    },

    // Caching and refetching configuration
    staleTime: 20000, // Consider data fresh for 20 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (formerly cacheTime)
    
    // Auto-refetch configuration
    refetchInterval: enabled ? refetchInterval : false,
    refetchIntervalInBackground: true, // Continue refetching when tab is not focused
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    
    // Retry configuration for failed requests
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Enable/disable query
    enabled,

    // Placeholder data to avoid loading state on refetch
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for manual flight data refresh
 */
export function useRefreshFlights() {
  // You can extend this with mutation if you want to invalidate all flight queries
  return {
    // This would be implemented with queryClient.invalidateQueries
    refreshAll: () => {
      console.log('🔄 Refreshing all flight data...');
      // Implementation depends on accessing queryClient
    },
  };
}
