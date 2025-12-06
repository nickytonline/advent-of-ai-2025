import { useEffect, useState } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface WebcamFeedProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
  mirrored?: boolean;
  className?: string;
}

export function WebcamFeed({ onVideoReady, mirrored = true, className = '' }: WebcamFeedProps) {
  // Persist camera selection across page reloads
  const [selectedDeviceId, setSelectedDeviceId] = useLocalStorage<string | undefined>(
    'homecoming-board-selected-camera',
    undefined
  );
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  
  const { videoRef, error, isLoading, startWebcam, stopWebcam, stream, availableCameras, refreshCameras } = useWebcam({
    deviceId: selectedDeviceId,
  });

  // Start webcam on mount and when selectedDeviceId changes
  useEffect(() => {
    console.log('🚀 WebcamFeed effect - selectedDeviceId:', selectedDeviceId);
    // Small delay to ensure previous stream is fully stopped
    const timer = setTimeout(() => {
      startWebcam();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [selectedDeviceId, startWebcam]);

  // Call onVideoReady when stream is attached to video element
  useEffect(() => {
    console.log('📹 Stream/Video check - stream:', stream, 'videoRef.current:', videoRef.current);
    
    if (!stream || !onVideoReady) return;
    
    // Poll for video element to be ready
    const checkVideoReady = (): (() => void) | false => {
      const video = videoRef.current;
      
      if (!video) {
        console.log('⏳ Video element not yet available, retrying...');
        return false;
      }
      
      const handleLoadedData = () => {
        console.log('✅ Video loadeddata event - calling onVideoReady');
        onVideoReady(video);
      };
      
      video.addEventListener('loadeddata', handleLoadedData);
      
      // If already loaded, call immediately
      if (video.readyState >= 2) {
        console.log('✅ Video already loaded (readyState:', video.readyState, ') - calling onVideoReady immediately');
        onVideoReady(video);
      }
      
      // Return cleanup function
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    };
    
    // Try immediately
    let cleanup: (() => void) | false = checkVideoReady();
    
    // If video element wasn't ready, retry with interval
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (cleanup === false) {
      intervalId = setInterval(() => {
        const result = checkVideoReady();
        if (result !== false) {
          cleanup = result;
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      }, 50);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [stream, onVideoReady]);

  const handleCameraChange = async (deviceId: string) => {
    console.log('🔄 Switching camera to:', deviceId);
    setShowCameraSelector(false);
    stopWebcam();
    // Wait a bit for the stream to fully stop before switching
    await new Promise(resolve => setTimeout(resolve, 100));
    // useLocalStorage hook handles saving to localStorage automatically
    setSelectedDeviceId(deviceId);
  };

  if (error) {
    return (
      <div className="webcam-error" style={{
        padding: '2rem',
        backgroundColor: '#FEE2E2',
        border: '2px solid #DC2626',
        borderRadius: '0.5rem',
        color: '#991B1B',
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
          📸 Webcam Access Error
        </h3>
        <p style={{ margin: '0 0 1rem 0' }}>{error.message}</p>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          Please ensure you've granted camera permissions and no other application is using the camera.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="webcam-loading" style={{
        padding: '2rem',
        backgroundColor: '#DBEAFE',
        border: '2px solid #3B82F6',
        borderRadius: '0.5rem',
        color: '#1E3A8A',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Requesting camera access...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={className}
        style={{
          transform: mirrored ? 'scaleX(-1)' : 'none',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#000',
        }}
      />
      
      {/* Camera selector button */}
      {availableCameras.length > 1 && (
        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <button
            onClick={() => setShowCameraSelector(!showCameraSelector)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            📹 Switch Camera
          </button>
          
          {/* Camera dropdown */}
          {showCameraSelector && (
            <div
              style={{
                position: 'absolute',
                top: '3rem',
                left: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                minWidth: '200px',
                zIndex: 1000,
              }}
            >
              {availableCameras.map((camera) => (
                <button
                  key={camera.deviceId}
                  onClick={() => handleCameraChange(camera.deviceId)}
                  style={{
                    display: 'block',
                    width: '100%',
                    backgroundColor: selectedDeviceId === camera.deviceId ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    marginBottom: '0.25rem',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDeviceId !== camera.deviceId) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDeviceId !== camera.deviceId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {selectedDeviceId === camera.deviceId && '✓ '}
                  {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
