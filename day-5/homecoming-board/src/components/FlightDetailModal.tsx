import type { ProcessedFlight } from '../hooks/useFlightData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface FlightDetailModalProps {
  flight: ProcessedFlight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlightDetailModal({ flight, open, onOpenChange }: FlightDetailModalProps) {
  if (!flight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
        aria-describedby="flight-details-description"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold text-cyan-300">
              {flight.callsign}
            </DialogTitle>
            <span 
              className="text-4xl" 
              role="img" 
              aria-label={flight.onGround ? 'Aircraft landed' : 'Aircraft in flight'}
            >
              {flight.onGround ? '🛬' : '✈️'}
            </span>
          </div>
          <DialogDescription id="flight-details-description" className="text-gray-300">
            Flight Details • {flight.country}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Status Section */}
          <section 
            className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/70"
            aria-labelledby="status-heading"
          >
            <h3 id="status-heading" className="text-sm font-semibold text-gray-200 mb-3">
              Status
            </h3>
            <div className="flex items-center gap-3">
              <div
                className={`
                  px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide
                  ${
                    flight.onGround
                      ? 'bg-green-700/60 text-green-200 border border-green-600/70'
                      : 'bg-blue-700/60 text-blue-200 border border-blue-600/70'
                  }
                `}
                role="status"
                aria-label={`Flight status: ${flight.status}`}
              >
                {flight.status}
              </div>
              <span className="text-sm text-gray-300">
                Last contact: <time dateTime={flight.lastContact.toISOString()}>{flight.lastContact.toLocaleString()}</time>
              </span>
            </div>
          </section>

          {/* Flight Parameters Grid */}
          <section aria-labelledby="parameters-heading">
            <h2 id="parameters-heading" className="sr-only">Flight Parameters</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/70">
                <p className="text-xs text-gray-200 mb-2 flex items-center gap-2">
                  <span role="img" aria-label="Altitude">📏</span>
                  <span>Altitude</span>
                </p>
                <p className="text-2xl font-bold text-white">
                  {flight.altitude !== null
                    ? `${Math.round(flight.altitude).toLocaleString()}m`
                    : 'N/A'}
                </p>
                {flight.altitude !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round(flight.altitude * 3.28084).toLocaleString()} ft
                  </p>
                )}
              </div>

              <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/70">
                <p className="text-xs text-gray-200 mb-2 flex items-center gap-2">
                  <span role="img" aria-label="Speed">⚡</span>
                  <span>Speed</span>
                </p>
                <p className="text-2xl font-bold text-white">
                  {flight.velocity !== null
                    ? `${Math.round(flight.velocity * 3.6)} km/h`
                    : 'N/A'}
                </p>
                {flight.velocity !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round(flight.velocity * 1.94384)} knots
                  </p>
                )}
              </div>

              <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/70">
                <p className="text-xs text-gray-200 mb-2 flex items-center gap-2">
                  <span role="img" aria-label="Heading">🧭</span>
                  <span>Heading</span>
                </p>
                <p className="text-2xl font-bold text-white">
                  {flight.heading !== null ? `${Math.round(flight.heading)}°` : 'N/A'}
                </p>
                {flight.heading !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    {getCardinalDirection(flight.heading)}
                  </p>
                )}
              </div>

              <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/70">
                <p className="text-xs text-gray-200 mb-2 flex items-center gap-2">
                  <span role="img" aria-label="Country">🌍</span>
                  <span>Country</span>
                </p>
                <p className="text-xl font-bold text-white truncate">
                  {flight.country}
                </p>
              </div>
            </div>
          </section>

          {/* Position Information */}
          {flight.position && (
            <section 
              className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/70"
              aria-labelledby="position-heading"
            >
              <h3 id="position-heading" className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <span role="img" aria-label="Position">📍</span>
                <span>Position</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Latitude</span>
                  <span className="text-sm font-mono text-cyan-300">
                    {flight.position.lat.toFixed(6)}°
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Longitude</span>
                  <span className="text-sm font-mono text-cyan-300">
                    {flight.position.lng.toFixed(6)}°
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Technical Information */}
          <section 
            className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/70"
            aria-labelledby="technical-heading"
          >
            <h3 id="technical-heading" className="text-sm font-semibold text-gray-200 mb-3">
              Technical Info
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">ICAO24 ID</span>
                <span className="text-sm font-mono text-white">{flight.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Callsign</span>
                <span className="text-sm font-mono text-white">{flight.callsign}</span>
              </div>
            </div>
          </section>

          {/* Winter decoration */}
          <div 
            className="text-center text-2xl opacity-20 pointer-events-none select-none" 
            aria-hidden="true"
          >
            ❄️ ❄️ ❄️
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper function to convert heading degrees to cardinal direction
 */
function getCardinalDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
