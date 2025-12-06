import { createFileRoute } from '@tanstack/react-router';
import { useFlightData } from '../hooks/useFlightData';

export const Route = createFileRoute('/test-flights')({
  component: TestFlights,
});

function TestFlights() {
  const { 
    data: flights, 
    isLoading, 
    error, 
    refetch,
    dataUpdatedAt 
  } = useFlightData({
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🛫 Flight Data Test</h1>
        
        {/* Status Bar */}
        <div className="bg-slate-800 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-xl font-semibold">
                {isLoading ? '⏳ Loading...' : error ? '❌ Error' : '✅ Success'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Flights Found</p>
              <p className="text-xl font-semibold">{flights?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Updated</p>
              <p className="text-sm">
                {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">❌ Error</h2>
            <p className="text-red-200">{error.message}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Fetching flight data from OpenSky Network...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && flights?.length === 0 && (
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <p className="text-2xl mb-2">✈️</p>
            <p className="text-gray-400">No flights found in this area</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting the bounding box coordinates</p>
          </div>
        )}

        {/* Flight List */}
        {flights && flights.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Flight Data (Raw JSON)
            </h2>
            <div className="grid gap-4">
              {flights.map((flight) => (
                <div 
                  key={flight.id}
                  className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-cyan-400">
                        {flight.callsign}
                      </h3>
                      <p className="text-sm text-gray-400">ID: {flight.id}</p>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${flight.onGround ? 'bg-green-900 text-green-200' : 'bg-blue-900 text-blue-200'}
                    `}>
                      {flight.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Country</p>
                      <p className="font-semibold">{flight.country}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Altitude</p>
                      <p className="font-semibold">
                        {flight.altitude ? `${Math.round(flight.altitude)}m` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Speed</p>
                      <p className="font-semibold">
                        {flight.velocity ? `${Math.round(flight.velocity * 3.6)} km/h` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Heading</p>
                      <p className="font-semibold">
                        {flight.heading ? `${Math.round(flight.heading)}°` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {flight.position && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs text-gray-400">
                        Position: {flight.position.lat.toFixed(4)}, {flight.position.lng.toFixed(4)}
                      </p>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    Last contact: {flight.lastContact.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <h3 className="text-sm font-bold text-gray-400 mb-2">🔍 Debug Info</h3>
          <div className="text-xs text-gray-500 space-y-1 font-mono">
            <p>API: OpenSky Network</p>
            <p>Bounding Box: JFK Area (40.5-40.8, -74.0--73.6)</p>
            <p>Refresh Interval: 30 seconds</p>
            <p>Stale Time: 20 seconds</p>
            <p>Cache Time: 5 minutes</p>
            <p>Retry Attempts: 3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
