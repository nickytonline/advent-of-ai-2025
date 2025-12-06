import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { HandTracker } from '../components/HandTracker'
import { FlightBoard } from '../components/FlightBoard'
import { useMediaPipe } from '../hooks/useMediaPipe'
import { useGestures } from '../hooks/useGestures'
import type { HandResults } from '../types/hand'
import type { GestureType } from '../utils/gestureDetection'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [currentGestureForBoard, setCurrentGestureForBoard] = useState<GestureType | null>(null)

  // MediaPipe hand tracking
  const { canvasRef, results, isReady, error, fps } = useMediaPipe(videoElement)

  // Gesture detection with callback
  const handleGesture = useCallback((gesture) => {
    console.log(`✨ Gesture detected: ${gesture.type} - ${gesture.hand} hand`)
    setCurrentGestureForBoard(gesture.type)
  }, [])

  const { currentGesture, allGestures } = useGestures(results, {
    onGesture: handleGesture,
    debounceMs: 300,
  })

  const handleGestureProcessed = useCallback(() => {
    // Clear the gesture after it's been processed by FlightBoard
    setCurrentGestureForBoard(null)
  }, [])

  const handsDetected = results?.multiHandLandmarks?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="py-8 px-6 text-center border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl">✈️</span>
            <h1 className="text-5xl md:text-6xl font-black text-white">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                The Homecoming Board
              </span>
            </h1>
            <span className="text-5xl">🧤</span>
          </div>
          <p className="text-xl text-cyan-200 mb-2 font-semibold">
            Gesture-Controlled Flight Tracker
          </p>
          <p className="text-sm text-blue-300">
            ❄️ Winter Festival Edition - No touching required! 🎄
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Hand Tracker - Full Width */}
          <div className="mb-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📹</span> Hand Tracking Camera
                <span className="text-sm text-gray-400 font-normal ml-2">
                  (Gesture indicators shown on video)
                </span>
              </h2>
              <HandTracker 
                onVideoReady={setVideoElement}
                canvasRef={canvasRef}
                showCanvas={true}
                showFps={true}
                fps={fps}
                handsDetected={handsDetected}
                isReady={isReady}
                error={error}
                currentGesture={currentGesture}
                allGestures={allGestures}
                className="rounded-lg overflow-hidden"
              />
            </div>
          </div>

          {/* Flight Board - Full Width */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <FlightBoard 
              gesture={currentGestureForBoard}
              onGestureProcessed={handleGestureProcessed}
            />
          </div>

          {/* How It Works */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700/50 rounded-xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💡</span> How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-3xl mb-2">🎥</div>
                <h3 className="font-bold text-cyan-300 mb-2">1. Hand Tracking</h3>
                <p className="text-gray-300">
                  MediaPipe AI detects and tracks 21 landmarks on your hand in real-time at 30+ FPS
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-bold text-cyan-300 mb-2">2. Gesture Recognition</h3>
                <p className="text-gray-300">
                  Custom algorithms analyze finger positions to recognize fist, palm, and thumbs up gestures
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-3xl mb-2">✈️</div>
                <h3 className="font-bold text-cyan-300 mb-2">3. Flight Control</h3>
                <p className="text-gray-300">
                  Your gestures control live flight data from OpenSky Network API, updated every 30 seconds
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-slate-700/50 mt-12 backdrop-blur-sm bg-slate-900/30">
        <p className="text-gray-400 text-sm">
          Built with TanStack Start • MediaPipe Hands • OpenSky Network • Day 5: Advent of AI 2025
        </p>
      </footer>
    </div>
  )
}
