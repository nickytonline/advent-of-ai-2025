import { useEffect, useRef, useState } from 'react';
import type { HandResults, HandTrackerConfig } from '../types/hand';
import { DEFAULT_HAND_CONFIG } from '../types/hand';

interface UseMediaPipeOptions {
  config?: Partial<HandTrackerConfig>;
  onResults?: (results: HandResults) => void;
}

interface UseMediaPipeReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  results: HandResults | null;
  isReady: boolean;
  error: Error | null;
  fps: number;
}

export function useMediaPipe(
  videoElement: HTMLVideoElement | null,
  options: UseMediaPipeOptions = {}
): UseMediaPipeReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<any>(null);
  const animationFrameIdRef = useRef<number>(0);
  
  const [results, setResults] = useState<HandResults | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fps, setFps] = useState(0);
  
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const fpsUpdateIntervalRef = useRef<number>(0);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !videoElement) return;

    const initializeHandDetection = async () => {
      try {
        setError(null);
        console.log('🤖 Initializing TensorFlow.js Hand Detection...');

        // Dynamically import TensorFlow.js
        console.log('📦 Loading TensorFlow.js modules...');
        const tf = await import('@tensorflow/tfjs');
        const handPoseDetection = await import('@tensorflow-models/hand-pose-detection');
        console.log('✅ TensorFlow modules loaded');

        // Check WebGL availability first
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        console.log('🔍 WebGL browser support:', {
          webgl2: !!canvas.getContext('webgl2'),
          webgl: !!canvas.getContext('webgl'),
          supported: !!gl
        });

        // Try to use WebGL backend (best for performance and accuracy)
        console.log('🔧 Attempting to use WebGL backend...');
        try {
          await tf.setBackend('webgl');
          await tf.ready();
          console.log(`✅ TensorFlow backend ready: ${tf.getBackend()}`);
        } catch (backendError) {
          console.warn('Could not set WebGL backend, trying CPU:', backendError);
          try {
            await tf.setBackend('cpu');
            await tf.ready();
            console.log(`⚠️ TensorFlow backend ready: ${tf.getBackend()} (CPU - may have limited functionality)`);
          } catch (cpuError) {
            console.warn('Could not set any backend, using default:', cpuError);
            await tf.ready();
            console.log(`⚠️ TensorFlow backend ready: ${tf.getBackend()}`);
          }
        }

        // Create MediaPipe Hands detector
        console.log('🖐️ Creating hand detector...');
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        
        // Try mediapipe runtime instead of tfjs (might have better coordinate support)
        const detectorConfig = {
          runtime: 'mediapipe' as const,
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
          maxHands: options.config?.maxNumHands || DEFAULT_HAND_CONFIG.maxNumHands,
        };
        
        console.log('⚙️ Detector config (trying mediapipe runtime):', detectorConfig);
        const detector = await handPoseDetection.createDetector(model, detectorConfig);
        
        console.log('✅ Hand detector created successfully');
        handLandmarkerRef.current = detector;

        // Mark as ready
        setIsReady(true);
        console.log('✅ Hand detection fully initialized and running!');

        // Start processing frames
        console.log('▶️ Starting video frame processing...');
        
        const processFrame = async () => {
          if (!handLandmarkerRef.current || !videoElement || videoElement.readyState < 2) {
            animationFrameIdRef.current = requestAnimationFrame(processFrame);
            return;
          }

          try {
            // Debug video element before estimation
            if (frameCountRef.current === 0) {
              console.log('🎥 Video element status:', {
                width: videoElement.videoWidth,
                height: videoElement.videoHeight,
                readyState: videoElement.readyState,
                paused: videoElement.paused,
                currentTime: videoElement.currentTime
              });
            }

            // Detect hands in the current frame
            const hands = await handLandmarkerRef.current.estimateHands(videoElement, {
              flipHorizontal: false
            });

            // Debug: Log the actual TensorFlow.js hand data structure
            if (hands.length > 0 && frameCountRef.current % 30 === 0) {
              console.log('🔍 TF.js hand data structure:', {
                keys: Object.keys(hands[0]),
                keypointsExists: !!hands[0].keypoints,
                keypointsLength: hands[0].keypoints?.length,
                firstKeypoint: hands[0].keypoints?.[0],
                handedness: hands[0].handedness,
                score: hands[0].score
              });
            }

            // Calculate FPS
            const now = performance.now();
            if (lastFrameTimeRef.current > 0) {
              frameCountRef.current++;
              if (now - fpsUpdateIntervalRef.current > 1000) {
                setFps(frameCountRef.current);
                frameCountRef.current = 0;
                fpsUpdateIntervalRef.current = now;
              }
            } else {
              fpsUpdateIntervalRef.current = now;
            }
            lastFrameTimeRef.current = now;

            // Log when hands are detected
            if (hands.length > 0) {
              console.log(`👋 Detected ${hands.length} hand(s)`);
              // Debug the actual data structure
              console.log('🔍 RAW TF.js hand[0]:', JSON.stringify(hands[0], null, 2));
            }

            // Convert TensorFlow format to our HandResults format
            const handResults: HandResults = {
              multiHandLandmarks: hands.map(hand => hand.keypoints),
              multiHandedness: hands.map(hand => ({
                label: hand.handedness || 'Unknown',
                score: hand.score || 0,
              })),
            };

            setResults(handResults);
            
            // Call custom callback if provided
            if (options.onResults) {
              options.onResults(handResults);
            }

            // Draw on canvas if available
            if (canvasRef.current && hands.length > 0) {
              console.log('🖌️ About to draw - canvas exists:', !!canvasRef.current, 'hands:', hands.length);
              drawResultsTF(canvasRef.current, videoElement, hands);
            } else if (hands.length > 0) {
              console.warn('⚠️ Hands detected but no canvas ref!', {
                canvasExists: !!canvasRef.current,
                handsCount: hands.length
              });
            }
          } catch (err) {
            console.warn('Frame processing error:', err);
          }

          // Continue processing
          animationFrameIdRef.current = requestAnimationFrame(processFrame);
        };
        
        // Start the frame loop
        processFrame();
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize hand detection');
        setError(error);
        console.error('Hand detection initialization error:', error);
      }
    };

    initializeHandDetection();

    // Cleanup
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.dispose?.();
      }
    };
  }, [videoElement, options.config?.maxNumHands, options.config?.modelComplexity]);

  return {
    canvasRef,
    results,
    isReady,
    error,
    fps,
  };
}

// Helper function to draw hand landmarks on canvas (TensorFlow.js format)
function drawResultsTF(canvas: HTMLCanvasElement, video: HTMLVideoElement, hands: any[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('❌ No canvas context');
    return;
  }

  // Set canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  console.log('🎨 Drawing on canvas:', {
    canvasSize: `${canvas.width}x${canvas.height}`,
    videoSize: `${video.videoWidth}x${video.videoHeight}`,
    handsCount: hands.length,
    firstHandKeypoints: hands[0]?.keypoints?.length
  });

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw each detected hand
  for (const hand of hands) {
    if (!hand.keypoints) continue;

    // Debug first keypoint to see actual values
    if (hand.keypoints.length > 0) {
      console.log('🔍 First keypoint (wrist):', hand.keypoints[0]);
    }

    // Draw connections between keypoints
    drawConnectionsTF(ctx, hand.keypoints);
    
    // Draw keypoint dots
    for (const keypoint of hand.keypoints) {
      const x = keypoint.x;
      const y = keypoint.y;
      
      // Debug if coordinates are null/undefined/NaN
      if (x == null || y == null || isNaN(x) || isNaN(y)) {
        console.warn('⚠️ Invalid keypoint:', keypoint);
        continue;
      }
      
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#00FF00';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

// Draw connections between hand keypoints (TensorFlow.js uses absolute coordinates)
function drawConnectionsTF(ctx: CanvasRenderingContext2D, keypoints: any[]) {
  // Hand keypoint connections (same indices as MediaPipe)
  const connections = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index finger
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle finger
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring finger
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm
    [5, 9], [9, 13], [13, 17],
  ];

  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;

  for (const [startIdx, endIdx] of connections) {
    const start = keypoints[startIdx];
    const end = keypoints[endIdx];
    
    if (!start || !end) continue;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
}
