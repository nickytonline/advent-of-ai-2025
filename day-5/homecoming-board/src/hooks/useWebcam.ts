import { useEffect, useRef, useState } from 'react';

interface UseWebcamOptions {
  videoConstraints?: MediaStreamConstraints['video'];
}

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: Error | null;
  isLoading: boolean;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startWebcam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎥 Requesting webcam access...');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: options.videoConstraints || {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });
      
      console.log('✅ Webcam access granted!', mediaStream);
      setStream(mediaStream);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to access webcam');
      setError(error);
      console.error('❌ Webcam error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      console.log('📹 Video element stream attached via effect');
    }
  }, [stream]);

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return {
    videoRef,
    stream,
    error,
    isLoading,
    startWebcam,
    stopWebcam,
  };
}
