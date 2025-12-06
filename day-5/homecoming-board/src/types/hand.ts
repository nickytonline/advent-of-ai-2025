// MediaPipe hand tracking types

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandResults {
  multiHandLandmarks?: NormalizedLandmark[][];
  multiHandedness?: Array<{
    index: number;
    score: number;
    label: 'Left' | 'Right';
  }>;
  image?: HTMLCanvasElement;
}

export interface HandTrackerConfig {
  maxNumHands: number;
  modelComplexity: 0 | 1;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

export const DEFAULT_HAND_CONFIG: HandTrackerConfig = {
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
};

// Hand landmark indices (MediaPipe convention)
export enum HandLandmark {
  WRIST = 0,
  THUMB_CMC = 1,
  THUMB_MCP = 2,
  THUMB_IP = 3,
  THUMB_TIP = 4,
  INDEX_FINGER_MCP = 5,
  INDEX_FINGER_PIP = 6,
  INDEX_FINGER_DIP = 7,
  INDEX_FINGER_TIP = 8,
  MIDDLE_FINGER_MCP = 9,
  MIDDLE_FINGER_PIP = 10,
  MIDDLE_FINGER_DIP = 11,
  MIDDLE_FINGER_TIP = 12,
  RING_FINGER_MCP = 13,
  RING_FINGER_PIP = 14,
  RING_FINGER_DIP = 15,
  RING_FINGER_TIP = 16,
  PINKY_MCP = 17,
  PINKY_PIP = 18,
  PINKY_DIP = 19,
  PINKY_TIP = 20,
}
