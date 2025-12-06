import { createFileRoute } from '@tanstack/react-router';
import { FlightBoard } from '../components/FlightBoard';

export const Route = createFileRoute('/flights')({
  component: FlightsPage,
});

function FlightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="py-8 px-6 text-center border-b border-slate-700">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl">✈️</span>
            <h1 className="text-5xl md:text-6xl font-black text-white">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Flight Board Test
              </span>
            </h1>
            <span className="text-5xl">❄️</span>
          </div>
          <p className="text-xl text-gray-300 mb-2">
            Live Flight Data from OpenSky Network
          </p>
          <p className="text-sm text-gray-400">
            Testing TanStack Query integration • JFK Area
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <FlightBoard
            onFlightSelect={(id) => console.log('Selected flight:', id)}
            onGestureNavigate={(direction) => console.log('Navigate:', direction)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-slate-700 mt-12">
        <p className="text-gray-400 text-sm">
          Built with TanStack Start • TanStack Query • OpenSky Network API
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Auto-refreshes every 30 seconds • Use ↑↓ arrow keys to navigate
        </p>
      </footer>
    </div>
  );
}
