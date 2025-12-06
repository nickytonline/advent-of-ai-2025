import { useEffect } from 'react';
import { useWebcam } from '../hooks/useWebcam';

interface WebcamFeedProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
  mirrored?: boolean;
  className?: string;
}

export function WebcamFeed({ onVideoReady, mirrored = true, className = '' }: WebcamFeedProps) {
  const { videoRef, error, isLoading, startWebcam, stream } = useWebcam();

  useEffect(() => {
    console.log('🚀 WebcamFeed mounted, starting webcam...');
    startWebcam();
  }, []);

  // Call onVideoReady when stream is attached to video element
  useEffect(() => {
    console.log('📹 Stream/Video check - stream:', stream, 'videoRef.current:', videoRef.current);
    
    if (stream && videoRef.current && onVideoReady) {
      const video = videoRef.current;
      
      const handleLoadedData = () => {
        console.log('✅ Video loadeddata event - calling onVideoReady');
        onVideoReady(video);
      };
      
      video.addEventListener('loadeddata', handleLoadedData);
      
      // If already loaded, call immediately
      if (video.readyState >= 2) {
        console.log('✅ Video already loaded (readyState:', video.readyState, ') - calling onVideoReady');
        onVideoReady(video);
      }
      
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [stream, onVideoReady]); // Depend on stream, not videoRef

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
      }}
    />
  );
}
