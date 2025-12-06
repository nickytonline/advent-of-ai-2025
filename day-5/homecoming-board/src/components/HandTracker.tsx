import { useState } from 'react';
import { WebcamFeed } from './WebcamFeed';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { useGestures } from '../hooks/useGestures';
import { GestureType } from '../utils/gestureDetection';
import type { HandResults } from '../types/hand';

interface HandTrackerProps {
  onHandsDetected?: (results: HandResults) => void;
  showCanvas?: boolean;
  showFps?: boolean;
  className?: string;
}

export function HandTracker({
  onHandsDetected,
  showCanvas = true,
  showFps = true,
  className = '',
}: HandTrackerProps) {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  console.log('🎬 HandTracker render - videoElement:', videoElement);

  const { canvasRef, results, isReady, error, fps } = useMediaPipe(videoElement, {
    onResults: onHandsDetected,
  });

  // Detect gestures from hand tracking results
  const { currentGesture } = useGestures(results, {
    onGesture: (gesture) => {
      console.log(`✨ Gesture: ${gesture.type} - ${gesture.hand} hand (${gesture.confidence})`);
    },
  });

  console.log('📊 HandTracker state - isReady:', isReady, 'error:', error, 'fps:', fps, 'results:', results);

  const handsDetected = results?.multiHandLandmarks?.length || 0;

  // Gesture display info
  const getGestureEmoji = (type: GestureType) => {
    switch (type) {
      case GestureType.CLOSED_FIST:
        return '✊';
      case GestureType.OPEN_PALM:
        return '🖐️';
      case GestureType.THUMBS_UP:
        return '👍';
      default:
        return '👋';
    }
  };

  const getGestureLabel = (type: GestureType) => {
    switch (type) {
      case GestureType.CLOSED_FIST:
        return 'Closed Fist';
      case GestureType.OPEN_PALM:
        return 'Open Palm';
      case GestureType.THUMBS_UP:
        return 'Thumbs Up';
      default:
        return 'Unknown gesture';
    }
  };

  return (
    <div className={`hand-tracker ${className}`} style={{ position: 'relative' }}>
      {/* Webcam Video */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
        <WebcamFeed onVideoReady={setVideoElement} mirrored={true} />

        {/* Canvas overlay for hand landmarks */}
        {showCanvas && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: 'scaleX(-1)', // Mirror to match video
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Status indicators */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'flex-end',
          }}
        >
          {/* FPS Counter */}
          {showFps && isReady && (
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: fps > 25 ? '#10B981' : fps > 15 ? '#F59E0B' : '#EF4444',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
              }}
            >
              {fps} FPS
            </div>
          )}

          {/* Hands detected indicator */}
          {isReady && (
            <div
              style={{
                backgroundColor: handsDetected > 0 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(107, 114, 128, 0.7)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>
                {handsDetected > 0 ? '✋' : '👋'}
              </span>
              {handsDetected > 0 ? `${handsDetected} Hand${handsDetected > 1 ? 's' : ''} Detected` : 'Show your hand'}
            </div>
          )}

          {/* Loading indicator */}
          {!isReady && !error && videoElement && (
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}
            >
              Initializing hand tracking...
            </div>
          )}
        </div>

        {/* MediaPipe error */}
        {error && (
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              backgroundColor: 'rgba(220, 38, 38, 0.9)',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <strong>Hand Tracking Error:</strong> {error.message}
          </div>
        )}
      </div>

      {/* Gesture Indicator */}
      {currentGesture && currentGesture.type !== GestureType.UNKNOWN && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(16, 185, 129, 0.95)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '1rem',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            animation: 'gesturePopIn 0.3s ease-out',
          }}
        >
          <span style={{ fontSize: '2rem' }}>{getGestureEmoji(currentGesture.type)}</span>
          <span>{getGestureLabel(currentGesture.type)}</span>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#F3F4F6',
          borderRadius: '0.5rem',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, color: '#374151' }}>
          <strong>👋 Hand Tracking Active</strong>
          <br />
          Try: <strong>closed fist ✊</strong>, <strong>open palm 🖐️</strong>, or <strong>thumbs up 👍</strong>
        </p>
      </div>

      <style>{`
        @keyframes gesturePopIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
