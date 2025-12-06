import { useState, useEffect } from 'react';
import type { HandResults } from '../types/hand';
import { GestureType } from '../utils/gestureDetection';

interface FingerCurlData {
  index: number;
  middle: number;
  ring: number;
  pinky: number;
  thumb: number;
}

interface GestureTuningProps {
  handResults: HandResults | null;
  onThresholdsChange?: (thresholds: GestureThresholds) => void;
}

export interface GestureThresholds {
  // Fist detection
  fistCurlThreshold: number;
  fistMinFingers: number;
  
  // Palm detection
  palmExtendThreshold: number;
  palmThumbMultiplier: number;
  
  // Thumbs up detection
  thumbsUpFingerCurl: number;
  thumbsUpThumbExtend: number;
  thumbsUpMinFingers: number;
  thumbsUpYThreshold: number;
  thumbsUpXThreshold: number;
}

export const DEFAULT_THRESHOLDS: GestureThresholds = {
  fistCurlThreshold: 0.4,
  fistMinFingers: 3,
  palmExtendThreshold: 0.3,
  palmThumbMultiplier: 1.5,
  thumbsUpFingerCurl: 0.6,
  thumbsUpThumbExtend: 0.25,
  thumbsUpMinFingers: 3,
  thumbsUpYThreshold: 0.05,
  thumbsUpXThreshold: 0.15,
};

export function GestureTuning({ handResults, onThresholdsChange }: GestureTuningProps) {
  const [thresholds, setThresholds] = useState<GestureThresholds>(DEFAULT_THRESHOLDS);
  const [fingerCurls, setFingerCurls] = useState<FingerCurlData | null>(null);
  const [detectedGesture, setDetectedGesture] = useState<GestureType>(GestureType.UNKNOWN);

  // Calculate finger curls from hand results
  useEffect(() => {
    console.log('🎛️ GestureTuning received handResults:', handResults?.multiHandLandmarks?.length || 0, 'hands');
    
    if (!handResults?.multiHandLandmarks?.[0]) {
      setFingerCurls(null);
      return;
    }

    const keypoints = handResults.multiHandLandmarks[0];
    if (keypoints.length < 21) return;

    // Helper to calculate curl
    const distance = (p1: any, p2: any) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getCurl = (tipIdx: number, mcpIdx: number) => {
      const tip = keypoints[tipIdx];
      const mcp = keypoints[mcpIdx];
      const wrist = keypoints[0];
      
      const tipToWrist = distance(tip, wrist);
      const mcpToWrist = distance(mcp, wrist);
      const ratio = tipToWrist / mcpToWrist;
      
      return Math.max(0, Math.min(1, (1.3 - ratio) / 0.4));
    };

    const curls = {
      index: getCurl(8, 5),
      middle: getCurl(12, 9),
      ring: getCurl(16, 13),
      pinky: getCurl(20, 17),
      thumb: getCurl(4, 2),
    };

    setFingerCurls(curls);

    // Detect gesture based on current thresholds
    const gesture = detectGestureWithThresholds(keypoints, thresholds);
    setDetectedGesture(gesture);
  }, [handResults, thresholds]);

  const handleThresholdChange = (key: keyof GestureThresholds, value: number) => {
    const newThresholds = { ...thresholds, [key]: value };
    setThresholds(newThresholds);
    onThresholdsChange?.(newThresholds);
  };

  const resetThresholds = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    onThresholdsChange?.(DEFAULT_THRESHOLDS);
  };

  if (!fingerCurls) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">🎛️ Gesture Tuning</h3>
        <p className="text-gray-400 text-center py-8">
          Show your hand to see real-time finger curl values
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">🎛️ Gesture Tuning</h3>
        <button
          onClick={resetThresholds}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Current Detection */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-lg p-4">
        <h4 className="font-bold text-purple-300 mb-2">Current Detection</h4>
        <div className="text-3xl text-center">
          {detectedGesture === GestureType.CLOSED_FIST && '✊ Fist'}
          {detectedGesture === GestureType.OPEN_PALM && '🖐️ Palm'}
          {detectedGesture === GestureType.THUMBS_UP && '👍 Thumbs Up'}
          {detectedGesture === GestureType.THUMBS_DOWN && '👎 Thumbs Down'}
          {detectedGesture === GestureType.UNKNOWN && '❓ Unknown'}
        </div>
      </div>

      {/* Finger Curl Values */}
      <div className="space-y-3">
        <h4 className="font-bold text-white">📊 Finger Curl Values (Live)</h4>
        <div className="space-y-2 text-sm">
          {Object.entries(fingerCurls).map(([finger, value]) => (
            <div key={finger} className="flex items-center gap-3">
              <span className="w-16 text-gray-300 capitalize">{finger}:</span>
              <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-200"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
              <span className="w-12 text-right text-gray-300 font-mono">
                {value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          0.0 = Extended • 1.0 = Curled
        </p>
      </div>

      {/* Fist Thresholds */}
      <div className="space-y-3 pt-4 border-t border-slate-700">
        <h4 className="font-bold text-blue-300">✊ Fist Detection Thresholds</h4>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Curl Threshold (fingers must be &gt; this value)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={thresholds.fistCurlThreshold}
              onChange={(e) => handleThresholdChange('fistCurlThreshold', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-white font-mono">
              {thresholds.fistCurlThreshold.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Minimum Curled Fingers (out of 4)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="2"
              max="4"
              step="1"
              value={thresholds.fistMinFingers}
              onChange={(e) => handleThresholdChange('fistMinFingers', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-white font-mono">
              {thresholds.fistMinFingers}
            </span>
          </div>
        </div>
      </div>

      {/* Palm Thresholds */}
      <div className="space-y-3 pt-4 border-t border-slate-700">
        <h4 className="font-bold text-green-300">🖐️ Palm Detection Thresholds</h4>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Extend Threshold (fingers must be &lt; this value)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={thresholds.palmExtendThreshold}
              onChange={(e) => handleThresholdChange('palmExtendThreshold', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-white font-mono">
              {thresholds.palmExtendThreshold.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Thumb Multiplier (thumb threshold = extend × this)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={thresholds.palmThumbMultiplier}
              onChange={(e) => handleThresholdChange('palmThumbMultiplier', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-white font-mono">
              {thresholds.palmThumbMultiplier.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Thumbs Up Thresholds */}
      <div className="space-y-3 pt-4 border-t border-slate-700">
        <h4 className="font-bold text-yellow-300">👍 Thumbs Up Detection Thresholds</h4>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Finger Curl (4 fingers must be &gt; this value)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.3"
              max="0.8"
              step="0.05"
              value={thresholds.thumbsUpFingerCurl}
              onChange={(e) => handleThresholdChange('thumbsUpFingerCurl', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-white font-mono">
              {thresholds.thumbsUpFingerCurl.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Thumb Extension (thumb must be &lt; this value)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={thresholds.thumbsUpThumbExtend}
              onChange={(e) => handleThresholdChange('thumbsUpThumbExtend', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-white font-mono">
              {thresholds.thumbsUpThumbExtend.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Y Threshold (vertical separation required)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="0.15"
              step="0.01"
              value={thresholds.thumbsUpYThreshold}
              onChange={(e) => handleThresholdChange('thumbsUpYThreshold', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-white font-mono">
              {thresholds.thumbsUpYThreshold.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            X Threshold (horizontal limit to avoid palm)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.05"
              max="0.3"
              step="0.01"
              value={thresholds.thumbsUpXThreshold}
              onChange={(e) => handleThresholdChange('thumbsUpXThreshold', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-white font-mono">
              {thresholds.thumbsUpXThreshold.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Export/Import */}
      <div className="pt-4 border-t border-slate-700 space-y-2">
        <button
          onClick={() => {
            const json = JSON.stringify(thresholds, null, 2);
            navigator.clipboard.writeText(json);
            alert('Thresholds copied to clipboard!');
          }}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          📋 Copy Thresholds
        </button>
        <p className="text-xs text-gray-400 text-center">
          Copy your tuned thresholds to save or share them
        </p>
      </div>
    </div>
  );
}

// Helper function to detect gestures with custom thresholds
function detectGestureWithThresholds(keypoints: any[], thresholds: GestureThresholds): GestureType {
  if (keypoints.length < 21) return GestureType.UNKNOWN;

  const distance = (p1: any, p2: any) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCurl = (tipIdx: number, mcpIdx: number) => {
    const tip = keypoints[tipIdx];
    const mcp = keypoints[mcpIdx];
    const wrist = keypoints[0];
    
    const tipToWrist = distance(tip, wrist);
    const mcpToWrist = distance(mcp, wrist);
    const ratio = tipToWrist / mcpToWrist;
    
    return Math.max(0, Math.min(1, (1.3 - ratio) / 0.4));
  };

  const fingerCurls = [
    getCurl(8, 5),   // index
    getCurl(12, 9),  // middle
    getCurl(16, 13), // ring
    getCurl(20, 17), // pinky
  ];
  const thumbCurl = getCurl(4, 2);

  // Get keypoints for orientation checks
  const thumbTip = keypoints[4];
  const thumbMcp = keypoints[2];
  const wrist = keypoints[0];
  const indexMcp = keypoints[5];

  // Check thumbs up (most specific first)
  const fingersCurledCount = fingerCurls.filter(c => c > thresholds.thumbsUpFingerCurl).length;
  const thumbExtended = thumbCurl < thresholds.thumbsUpThumbExtend;
  const thumbPointingUp = 
    thumbTip.y < thumbMcp.y - 0.03 && 
    thumbTip.y < wrist.y - thresholds.thumbsUpYThreshold &&
    thumbTip.y < indexMcp.y;
  const thumbNotTooExtended = Math.abs(thumbTip.x - thumbMcp.x) < thresholds.thumbsUpXThreshold;

  if (fingersCurledCount >= thresholds.thumbsUpMinFingers && thumbExtended && thumbPointingUp && thumbNotTooExtended) {
    return GestureType.THUMBS_UP;
  }

  // Check fist
  const fistCurledCount = fingerCurls.filter(c => c > thresholds.fistCurlThreshold).length;
  if (fistCurledCount >= thresholds.fistMinFingers) {
    return GestureType.CLOSED_FIST;
  }

  // Check open palm
  const allFingersExtended = fingerCurls.every(c => c < thresholds.palmExtendThreshold);
  const palmThumbExtended = thumbCurl < (thresholds.palmExtendThreshold * thresholds.palmThumbMultiplier);
  if (allFingersExtended && palmThumbExtended) {
    return GestureType.OPEN_PALM;
  }

  return GestureType.UNKNOWN;
}
