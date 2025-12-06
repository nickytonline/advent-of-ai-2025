import { createFileRoute } from '@tanstack/react-router'
import { HandTracker } from '../components/HandTracker'
import type { HandResults } from '../types/hand'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const handleHandsDetected = (results: HandResults) => {
    // Log hand detection for debugging
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      console.log(`Detected ${results.multiHandLandmarks.length} hand(s)`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="py-8 px-6 text-center border-b border-slate-700">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl">✈️</span>
            <h1 className="text-5xl md:text-6xl font-black text-white">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                The Homecoming Board
              </span>
            </h1>
            <span className="text-5xl">🧤</span>
          </div>
          <p className="text-xl text-gray-300 mb-2">
            Gesture-Controlled Flight Tracker
          </p>
          <p className="text-sm text-gray-400">
            ❄️ Winter Festival Edition - No touching required!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Introduction Card */}
          <div className="mb-8 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <span>👋</span> Hand Tracking Test
            </h2>
            <p className="text-gray-300 mb-2">
              Welcome to Phase 2! We're testing the hand tracking foundation before adding gestures and flight data.
            </p>
            <ul className="text-gray-400 space-y-1 text-sm">
              <li>✅ MediaPipe Hands integration</li>
              <li>✅ Webcam access with error handling</li>
              <li>✅ Real-time hand landmark detection</li>
              <li>✅ FPS counter for performance monitoring</li>
              <li>✅ Mirrored video and landmarks</li>
            </ul>
          </div>

          {/* Hand Tracker Component */}
          <HandTracker 
            onHandsDetected={handleHandsDetected}
            showCanvas={true}
            showFps={true}
          />

          {/* Next Steps Card */}
          <div className="mt-8 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <span>🎯</span> What's Next?
            </h2>
            <div className="space-y-2 text-gray-300">
              <p><strong>Phase 3:</strong> Gesture Recognition</p>
              <ul className="text-gray-400 space-y-1 text-sm ml-4">
                <li>• Implement closed fist detection</li>
                <li>• Implement open palm detection</li>
                <li>• Add gesture debouncing</li>
                <li>• Visual feedback for gestures</li>
              </ul>
              <p className="mt-3"><strong>Phase 4:</strong> Flight Data Integration</p>
              <ul className="text-gray-400 space-y-1 text-sm ml-4">
                <li>• TanStack Start server function for OpenSky API</li>
                <li>• Real-time flight data display</li>
                <li>• Caching and rate limit handling</li>
              </ul>
            </div>
          </div>

          {/* Performance Info */}
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>💡 Performance Tip:</strong> For smooth hand tracking, aim for 30+ FPS. 
              If FPS is low, try adjusting <code className="px-2 py-1 bg-slate-700 rounded text-cyan-400">modelComplexity</code> 
              to 0 in the MediaPipe config or reduce video resolution.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-slate-700 mt-12">
        <p className="text-gray-400 text-sm">
          Built with TanStack Start • MediaPipe Hands • Day 5: Advent of AI 2025
        </p>
      </footer>
    </div>
  )
}
