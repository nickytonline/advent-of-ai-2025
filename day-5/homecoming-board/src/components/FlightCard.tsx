import type { ProcessedFlight } from '../hooks/useFlightData';

interface FlightCardProps {
  flight: ProcessedFlight;
  isSelected?: boolean;
  onClick?: () => void;
}

export function FlightCard({ flight, isSelected = false, onClick }: FlightCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-slate-800/90 to-slate-900/90
        backdrop-blur-sm
        border-2 rounded-xl p-6
        transition-all duration-300 ease-in-out
        cursor-pointer
        ${
          isSelected
            ? 'border-cyan-400 shadow-lg shadow-cyan-500/50 scale-105'
            : 'border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/30'
        }
        ${onClick ? 'hover:scale-102' : ''}
      `}
    >
      {/* Winter decoration - snowflakes */}
      <div className="absolute top-2 right-2 text-cyan-400/20 text-2xl">❄️</div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-cyan-400 mb-1">
            {flight.callsign}
          </h3>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <span>🌍</span>
            <span>{flight.country}</span>
          </p>
        </div>
        
        {/* Status Badge */}
        <div
          className={`
            px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide
            flex items-center gap-1.5
            ${
              flight.onGround
                ? 'bg-green-900/50 text-green-300 border border-green-700/50'
                : 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
            }
          `}
        >
          <span className="text-base">
            {flight.onGround ? '🛬' : '✈️'}
          </span>
          <span>{flight.status}</span>
        </div>
      </div>

      {/* Flight Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
          <p className="text-xs text-gray-400 mb-1">Altitude</p>
          <p className="text-lg font-semibold text-white">
            {flight.altitude !== null
              ? `${Math.round(flight.altitude).toLocaleString()}m`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
          <p className="text-xs text-gray-400 mb-1">Speed</p>
          <p className="text-lg font-semibold text-white">
            {flight.velocity !== null
              ? `${Math.round(flight.velocity * 3.6)} km/h`
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex justify-between items-center text-sm">
        <div>
          <p className="text-gray-400">Heading</p>
          <p className="font-semibold text-white">
            {flight.heading !== null ? `${Math.round(flight.heading)}°` : 'N/A'}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-gray-400">Last Contact</p>
          <p className="font-semibold text-white">
            {flight.lastContact.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Position Info (optional detailed view) */}
      {isSelected && flight.position && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-gray-400 mb-1">📍 Position</p>
          <p className="text-xs font-mono text-cyan-400">
            {flight.position.lat.toFixed(4)}°, {flight.position.lng.toFixed(4)}°
          </p>
          <p className="text-xs text-gray-500 mt-1">ID: {flight.id}</p>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-cyan-400 rounded-xl pointer-events-none animate-pulse" />
      )}
    </div>
  );
}
