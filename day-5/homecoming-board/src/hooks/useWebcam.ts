import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebcamOptions {
  videoConstraints?: MediaStreamConstraints['video'];
  deviceId?: string;
}

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: Error | null;
  isLoading: boolean;
  supported: boolean;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  availableCameras: MediaDeviceInfo[];
  refreshCameras: () => Promise<void>;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const optionsRef = useRef(options);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return typeof navigator.mediaDevices?.getUserMedia === 'function';
  });
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setIsSupported(typeof navigator.mediaDevices?.getUserMedia === 'function');
  }, []);

  const refreshCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      console.log('📹 Available cameras:', videoDevices.map(d => d.label || d.deviceId));
    } catch (err) {
      console.error('❌ Failed to enumerate cameras:', err);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      console.log('🛑 Stopping webcam stream');
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSupported || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Webcam not supported in this browser');
      }

      // Ensure any existing stream is stopped before requesting a new one
      stopWebcam();

      console.log('🎥 Requesting webcam access with deviceId:', optionsRef.current.deviceId);

      const videoConstraints = optionsRef.current.videoConstraints || {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        ...(optionsRef.current.deviceId ? { deviceId: { exact: optionsRef.current.deviceId } } : { facingMode: 'user' }),
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      console.log('✅ Webcam access granted!', mediaStream);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      // Refresh camera list after getting permission
      await refreshCameras();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to access webcam');
      setError(error);
      console.error('❌ Webcam error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshCameras, stopWebcam]); // Remove options from dependencies, use optionsRef instead

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (!stream) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const attachStream = () => {
      const video = videoRef.current;

      if (video) {
        console.log('📹 Attaching stream to video element', {
          streamId: stream.id,
          videoElement: video.tagName
        });

        video.srcObject = stream;

        // Force play in case autoplay didn't trigger
        video.play().catch(err => {
          console.warn('⚠️ Video play failed (might be ok):', err);
        });
      } else {
        console.log('⏳ Video element not ready yet, will retry...');
        // Retry after a short delay if video element isn't ready
        retryTimer = setTimeout(() => {
          attachStream();
        }, 50);
      }
    };

    attachStream();

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [stream]); // Only depend on stream, not videoRef.current

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

    return {
      videoRef,
      stream,
      error,
      isLoading,
      supported: isSupported,
      startWebcam,
      stopWebcam,
      availableCameras,
      refreshCameras,
    };
  }
