/**
 * Gesture Detection Utilities
 * 
 * Analyzes hand keypoints to detect specific gestures:
 * - Closed Fist: All fingers curled in
 * - Open Palm: All fingers extended
 */

export interface Keypoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
}

export enum GestureType {
  CLOSED_FIST = 'CLOSED_FIST',
  OPEN_PALM = 'OPEN_PALM',
  UNKNOWN = 'UNKNOWN',
}

export interface GestureResult {
  type: GestureType;
  confidence: number;
  hand: 'Left' | 'Right' | 'Unknown';
}

// Hand landmark indices (MediaPipe standard)
const LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  MIDDLE_TIP: 12,
  RING_TIP: 16,
  PINKY_TIP: 20,
  THUMB_MCP: 2,
  INDEX_MCP: 5,
  MIDDLE_MCP: 9,
  RING_MCP: 13,
  PINKY_MCP: 17,
};

/**
 * Calculate Euclidean distance between two points
 */
function distance(p1: Keypoint, p2: Keypoint): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the curl ratio of a finger
 * Returns value between 0 (extended) and 1 (curled)
 */
function getFingerCurlRatio(
  keypoints: Keypoint[],
  tipIndex: number,
  mcpIndex: number,
  wristIndex: number = LANDMARK_INDICES.WRIST
): number {
  const tip = keypoints[tipIndex];
  const mcp = keypoints[mcpIndex];
  const wrist = keypoints[wristIndex];

  // Distance from fingertip to wrist
  const tipToWrist = distance(tip, wrist);
  
  // Distance from MCP (knuckle) to wrist
  const mcpToWrist = distance(mcp, wrist);

  // If tip is closer to wrist than knuckle, finger is curled
  // Ratio close to 0 = extended, close to 1 = curled
  const ratio = tipToWrist / mcpToWrist;
  
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, 1 - ratio));
}

/**
 * Detect if hand is making a closed fist gesture
 * All fingers should be curled in
 */
export function detectClosedFist(
  keypoints: Keypoint[],
  threshold: number = 0.6
): boolean {
  if (keypoints.length < 21) return false;

  const fingerCurls = [
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.INDEX_TIP, LANDMARK_INDICES.INDEX_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.MIDDLE_TIP, LANDMARK_INDICES.MIDDLE_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.RING_TIP, LANDMARK_INDICES.RING_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.PINKY_TIP, LANDMARK_INDICES.PINKY_MCP),
  ];

  // Thumb is special - check if it's also curled or tucked
  const thumbCurl = getFingerCurlRatio(keypoints, LANDMARK_INDICES.THUMB_TIP, LANDMARK_INDICES.THUMB_MCP);

  // All fingers should be curled above threshold
  const allFingersCurled = fingerCurls.every(curl => curl > threshold);
  const thumbCurled = thumbCurl > threshold * 0.7; // Thumb threshold slightly lower

  return allFingersCurled && thumbCurled;
}

/**
 * Detect if hand is making an open palm gesture
 * All fingers should be extended
 */
export function detectOpenPalm(
  keypoints: Keypoint[],
  threshold: number = 0.6
): boolean {
  if (keypoints.length < 21) return false;

  const fingerCurls = [
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.INDEX_TIP, LANDMARK_INDICES.INDEX_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.MIDDLE_TIP, LANDMARK_INDICES.MIDDLE_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.RING_TIP, LANDMARK_INDICES.RING_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.PINKY_TIP, LANDMARK_INDICES.PINKY_MCP),
  ];

  const thumbCurl = getFingerCurlRatio(keypoints, LANDMARK_INDICES.THUMB_TIP, LANDMARK_INDICES.THUMB_MCP);

  // All fingers should be extended (curl ratio below threshold)
  const allFingersExtended = fingerCurls.every(curl => curl < (1 - threshold));
  const thumbExtended = thumbCurl < (1 - threshold * 0.7);

  return allFingersExtended && thumbExtended;
}

/**
 * Detect gesture from hand keypoints
 */
export function detectGesture(
  keypoints: Keypoint[],
  handedness: 'Left' | 'Right' | 'Unknown' = 'Unknown'
): GestureResult {
  if (!keypoints || keypoints.length < 21) {
    console.warn('⚠️ Invalid keypoints:', keypoints?.length);
    return {
      type: GestureType.UNKNOWN,
      confidence: 0,
      hand: handedness,
    };
  }

  // Debug: Calculate and log finger curls
  const fingerCurls = [
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.INDEX_TIP, LANDMARK_INDICES.INDEX_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.MIDDLE_TIP, LANDMARK_INDICES.MIDDLE_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.RING_TIP, LANDMARK_INDICES.RING_MCP),
    getFingerCurlRatio(keypoints, LANDMARK_INDICES.PINKY_TIP, LANDMARK_INDICES.PINKY_MCP),
  ];
  console.log('👆 Finger curls:', fingerCurls.map(c => c.toFixed(2)).join(', '));

  // Check for closed fist first (more distinct)
  const isFist = detectClosedFist(keypoints, 0.6);
  console.log('✊ Is fist?', isFist);
  
  if (isFist) {
    return {
      type: GestureType.CLOSED_FIST,
      confidence: 0.9,
      hand: handedness,
    };
  }

  // Check for open palm
  const isPalm = detectOpenPalm(keypoints, 0.6);
  console.log('🖐️ Is palm?', isPalm);
  
  if (isPalm) {
    return {
      type: GestureType.OPEN_PALM,
      confidence: 0.85,
      hand: handedness,
    };
  }

  // No gesture detected
  return {
    type: GestureType.UNKNOWN,
    confidence: 0,
    hand: handedness,
  };
}

/**
 * Debounce gesture detection to prevent rapid firing
 */
export class GestureDebouncer {
  private lastGesture: GestureType = GestureType.UNKNOWN;
  private lastGestureTime: number = 0;
  private readonly debounceMs: number;

  constructor(debounceMs: number = 300) {
    this.debounceMs = debounceMs;
  }

  /**
   * Process gesture with debouncing
   * Returns gesture only if it's different from last or enough time has passed
   */
  process(gesture: GestureResult): GestureResult | null {
    const now = Date.now();
    const timeSinceLastGesture = now - this.lastGestureTime;

    // If same gesture and within debounce window, ignore
    if (gesture.type === this.lastGesture && timeSinceLastGesture < this.debounceMs) {
      return null;
    }

    // If unknown gesture, don't update
    if (gesture.type === GestureType.UNKNOWN) {
      return null;
    }

    // New gesture detected!
    this.lastGesture = gesture.type;
    this.lastGestureTime = now;

    return gesture;
  }

  reset() {
    this.lastGesture = GestureType.UNKNOWN;
    this.lastGestureTime = 0;
  }
}
