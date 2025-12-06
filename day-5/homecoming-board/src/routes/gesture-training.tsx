import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import { HandTracker } from '../components/HandTracker'
import { SettingsButton } from '../components/SettingsButton'
import { useMediaPipe } from '../hooks/useMediaPipe'
import { useGestures } from '../hooks/useGestures'
import { useSettings } from '../contexts/SettingsContext'
import { setSoundEnabled } from '../utils/gestureAudio'
import type { GestureType } from '../utils/gestureDetection'

export const Route = createFileRoute('/gesture-training')({ component: GestureTraining })

function GestureTraining() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const { soundEnabled } = useSettings()

  // Sync sound settings with audio utility
  useEffect(() => {
    setSoundEnabled(soundEnabled)
  }, [soundEnabled])

  // MediaPipe hand tracking
  const { canvasRef, results, isReady, error, fps } = useMediaPipe(videoElement)

  // Gesture detection with callback
  const handleGesture = useCallback((gesture) => {
    console.log(`✨ Gesture detected: ${gesture.type} - ${gesture.hand} hand`)
  }, [])

  const { currentGesture, allGestures } = useGestures(results, {
    onGesture: handleGesture,
    debounceMs: 300,
  })

  const handsDetected = results?.multiHandLandmarks?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="py-8 px-6 text-center border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl">🧤</span>
            <h1 className="text-5xl md:text-6xl font-black text-white">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                Gesture Training Mode
              </span>
            </h1>
            <span className="text-5xl">🎯</span>
          </div>
          <p className="text-xl text-purple-200 mb-2 font-semibold">
            Practice Your Hand Gestures
          </p>
          <p className="text-sm text-pink-300">
            Perfect your gestures before using them on the flight board!
          </p>
          
          {/* Navigation */}
          <div className="mt-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              <span>✈️</span> Go to Flight Board
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Settings Button */}
          <div className="mb-6">
            <SettingsButton />
          </div>

          {/* Hand Tracker - Full Width */}
          <div className="mb-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-4">
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

          {/* Gesture Guide */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🎓</span> Gesture Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Fist Gesture */}
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-600/50 rounded-xl p-6">
                <div className="text-5xl mb-3 text-center">👊</div>
                <h3 className="text-xl font-bold text-cyan-300 mb-3 text-center">Fist</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">Action:</strong> Next Flight</p>
                  <p><strong className="text-white">How to:</strong> Close all fingers into a fist</p>
                  <p><strong className="text-white">Tip:</strong> Make sure all fingertips are below your knuckles</p>
                </div>
              </div>

              {/* Palm Gesture */}
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-600/50 rounded-xl p-6">
                <div className="text-5xl mb-3 text-center">🖐️</div>
                <h3 className="text-xl font-bold text-green-300 mb-3 text-center">Palm</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">Action:</strong> Previous Flight</p>
                  <p><strong className="text-white">How to:</strong> Open all fingers wide</p>
                  <p><strong className="text-white">Tip:</strong> Spread fingers apart for best detection</p>
                </div>
              </div>

              {/* Thumbs Up Gesture */}
              <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-600/50 rounded-xl p-6">
                <div className="text-5xl mb-3 text-center">👍</div>
                <h3 className="text-xl font-bold text-yellow-300 mb-3 text-center">Thumbs Up</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">Action:</strong> View Flight Details</p>
                  <p><strong className="text-white">How to:</strong> Thumb up, other fingers closed</p>
                  <p><strong className="text-white">Tip:</strong> Keep thumb pointing straight up</p>
                </div>
              </div>

            </div>
          </div>

          {/* Training Tips */}
          <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💡</span> Training Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-3xl mb-2">🎥</div>
                <h3 className="font-bold text-purple-300 mb-2">Camera Position</h3>
                <p className="text-gray-300">
                  Position your hand 1-2 feet from the camera for best tracking. Ensure good lighting.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-3xl mb-2">⏱️</div>
                <h3 className="font-bold text-purple-300 mb-2">Hold Steady</h3>
                <p className="text-gray-300">
                  Hold each gesture for at least 300ms. The system debounces to prevent accidental triggers.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-3xl mb-2">🖐️</div>
                <h3 className="font-bold text-purple-300 mb-2">Clear Gestures</h3>
                <p className="text-gray-300">
                  Make deliberate, exaggerated gestures. The system needs clear finger positions.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-3xl mb-2">🔊</div>
                <h3 className="font-bold text-purple-300 mb-2">Audio Feedback</h3>
                <p className="text-gray-300">
                  Listen for audio cues when gestures are detected. This helps confirm recognition.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-slate-700/50 mt-12 backdrop-blur-sm bg-slate-900/30">
        <p className="text-gray-400 text-sm">
          Built with TanStack Start • MediaPipe Hands • Day 5: Advent of AI 2025
        </p>
      </footer>
    </div>
  )
}
