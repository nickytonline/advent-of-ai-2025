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
  allGestures: GestureResult[]; // All current gestures (one per hand)
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
  const [allGestures, setAllGestures] = useState<GestureResult[]>([]);
  const [gestureHistory, setGestureHistory] = useState<GestureResult[]>([]);
  
  // Separate debouncers for left and right hands
  const leftDebouncerRef = useRef(new GestureDebouncer(debounceMs));
  const rightDebouncerRef = useRef(new GestureDebouncer(debounceMs));

  const clearHistory = useCallback(() => {
    setGestureHistory([]);
  }, []);

  useEffect(() => {
    if (!enabled || !handResults) {
      setCurrentGesture(null);
      setAllGestures([]);
      return;
    }

    // Process each detected hand
    const { multiHandLandmarks, multiHandedness } = handResults;

    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      setCurrentGesture(null);
      setAllGestures([]);
      return;
    }

    console.log(`🖐️ Processing ${multiHandLandmarks.length} hand(s)`);

    // Detect gestures for all hands
    const detectedGestures: GestureResult[] = [];
    
    for (let i = 0; i < multiHandLandmarks.length; i++) {
      const keypoints = multiHandLandmarks[i];
      const handedness = (multiHandedness?.[i]?.label || 'Unknown') as 'Left' | 'Right' | 'Unknown';

      // Detect gesture for this hand
      const gesture = detectGesture(keypoints, handedness);
      
      // Use appropriate debouncer based on hand
      const debouncer = handedness === 'Left' ? leftDebouncerRef.current : rightDebouncerRef.current;
      const debouncedGesture = debouncer.process(gesture);

      if (debouncedGesture) {
        console.log(`✨ Gesture confirmed: ${debouncedGesture.type} (${debouncedGesture.hand} hand)`);
        detectedGestures.push(debouncedGesture);
        
        // Add to history (keep last 10)
        setGestureHistory(prev => [...prev, debouncedGesture].slice(-10));

        // Call callback if provided
        if (onGesture) {
          onGesture(debouncedGesture);
        }
      }
      
      // Also add non-debounced gestures if they're not UNKNOWN
      if (!debouncedGesture && gesture.type !== GestureType.UNKNOWN) {
        detectedGestures.push(gesture);
      }
    }

    // Update state
    setAllGestures(detectedGestures);
    
    // Set currentGesture to first detected gesture (for backwards compatibility)
    setCurrentGesture(detectedGestures.length > 0 ? detectedGestures[0] : null);
    
  }, [handResults, enabled, onGesture]);

  return {
    currentGesture,
    allGestures,
    gestureHistory,
    clearHistory,
  };
}
