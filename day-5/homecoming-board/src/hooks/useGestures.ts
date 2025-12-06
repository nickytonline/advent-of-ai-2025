import { useState, useEffect, useRef, useCallback } from 'react';
import { detectGesture, GestureDebouncer, GestureType, type GestureResult } from '../utils/gestureDetection';
import type { HandResults } from '../types/hand';

interface UseGesturesOptions {
  onGesture?: (gesture: GestureResult) => void;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseGesturesReturn {
  currentGesture: GestureResult | null;
  gestureHistory: GestureResult[];
  clearHistory: () => void;
}

export function useGestures(
  handResults: HandResults | null,
  options: UseGesturesOptions = {}
): UseGesturesReturn {
  const {
    onGesture,
    debounceMs = 300,
    enabled = true,
  } = options;

  const [currentGesture, setCurrentGesture] = useState<GestureResult | null>(null);
  const [gestureHistory, setGestureHistory] = useState<GestureResult[]>([]);
  
  const debouncerRef = useRef(new GestureDebouncer(debounceMs));

  const clearHistory = useCallback(() => {
    setGestureHistory([]);
  }, []);

  useEffect(() => {
    if (!enabled || !handResults) {
      setCurrentGesture(null);
      return;
    }

    // Process each detected hand
    const { multiHandLandmarks, multiHandedness } = handResults;

    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      setCurrentGesture(null);
      return;
    }

    // For now, just process the first hand
    const keypoints = multiHandLandmarks[0];
    const handedness = multiHandedness?.[0]?.label || 'Unknown';

    // Debug: log keypoint data
    console.log('🔍 Keypoints received:', keypoints?.length, 'keypoints');
    if (keypoints && keypoints.length > 0) {
      console.log('First keypoint sample:', keypoints[0]);
    }

    // Detect gesture
    const gesture = detectGesture(keypoints, handedness);
    console.log('🎯 Raw gesture detected:', gesture.type, 'confidence:', gesture.confidence);

    // Apply debouncing
    const debouncedGesture = debouncerRef.current.process(gesture);

    if (debouncedGesture) {
      console.log(`✨ Gesture confirmed: ${debouncedGesture.type} (${debouncedGesture.hand} hand)`);
      
      setCurrentGesture(debouncedGesture);
      
      // Add to history (keep last 10)
      setGestureHistory(prev => [...prev, debouncedGesture].slice(-10));

      // Call callback if provided
      if (onGesture) {
        onGesture(debouncedGesture);
      }
    }
  }, [handResults, enabled, onGesture]);

  return {
    currentGesture,
    gestureHistory,
    clearHistory,
  };
}
