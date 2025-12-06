import { useState, useEffect, useCallback } from 'react';
import type { HandResults } from '../types/hand';
import { GestureType } from '../utils/gestureDetection';

interface FingerCurlData {
  index: number;
  middle: number;
  ring: number;
  pinky: number;
  thumb: number;
}

interface GestureSample {
  fingerCurls: FingerCurlData;
  thumbPosition: {
    x: number;
    y: number;
  };
  correctGesture: GestureType;
  timestamp: number;
}

interface GestureTrainerOverlayProps {
  handResults: HandResults | null;
  onThresholdsLearned?: (thresholds: any) => void;
}

const SAMPLES_NEEDED = 3;

export function GestureTrainerOverlay({ handResults, onThresholdsLearned }: GestureTrainerOverlayProps) {
  const [fingerCurls, setFingerCurls] = useState<FingerCurlData | null>(null);
  const [detectedGesture, setDetectedGesture] = useState<GestureType>(GestureType.UNKNOWN);
  const [isWaitingForCorrection, setIsWaitingForCorrection] = useState(false);
  const [samples, setSamples] = useState<Map<GestureType, GestureSample[]>>(new Map());
  const [trainingMode, setTrainingMode] = useState(false);
  
  // Calculate finger curls from hand results
  useEffect(() => {
    if (!handResults?.multiHandLandmarks?.[0]) {
      setFingerCurls(null);
      setDetectedGesture(GestureType.UNKNOWN);
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

    // Simple detection for display (this is what we'll improve)
    const gesture = detectGestureSimple(keypoints, curls);
    setDetectedGesture(gesture);
  }, [handResults]);

  const handleCorrection = useCallback((correctGesture: GestureType) => {
    if (!fingerCurls || !handResults?.multiHandLandmarks?.[0]) return;

    const keypoints = handResults.multiHandLandmarks[0];
    const thumbTip = keypoints[4];
    
    const sample: GestureSample = {
      fingerCurls,
      thumbPosition: { x: thumbTip.x, y: thumbTip.y },
      correctGesture,
      timestamp: Date.now(),
    };

    setSamples(prev => {
      const newSamples = new Map(prev);
      const gestureSamples = newSamples.get(correctGesture) || [];
      gestureSamples.push(sample);
      newSamples.set(correctGesture, gestureSamples);
      return newSamples;
    });

    setIsWaitingForCorrection(false);
    
    // Don't auto-trigger learning - let user click "Finish Training" button when ready
  }, [fingerCurls, handResults, samples]);

  const learnThresholds = useCallback(() => {
    // Calculate optimal thresholds based on collected samples
    const fistSamples = samples.get(GestureType.CLOSED_FIST) || [];
    const palmSamples = samples.get(GestureType.OPEN_PALM) || [];
    const thumbsUpSamples = samples.get(GestureType.THUMBS_UP) || [];
    const thumbsDownSamples = samples.get(GestureType.THUMBS_DOWN) || [];

    console.log('📊 Training data:', {
      fist: fistSamples.length,
      palm: palmSamples.length,
      thumbsUp: thumbsUpSamples.length,
      thumbsDown: thumbsDownSamples.length,
    });

    // Calculate finger-by-finger averages AND standard deviation for each gesture
    // This helps us understand variance and set more robust thresholds
    const calcAvgCurls = (samples: GestureSample[]) => {
      if (samples.length === 0) return null;
      
      const sums = { index: 0, middle: 0, ring: 0, pinky: 0, thumb: 0 };
      samples.forEach(s => {
        sums.index += s.fingerCurls.index;
        sums.middle += s.fingerCurls.middle;
        sums.ring += s.fingerCurls.ring;
        sums.pinky += s.fingerCurls.pinky;
        sums.thumb += s.fingerCurls.thumb;
      });
      
      const averages = {
        index: sums.index / samples.length,
        middle: sums.middle / samples.length,
        ring: sums.ring / samples.length,
        pinky: sums.pinky / samples.length,
        thumb: sums.thumb / samples.length,
        avg: (sums.index + sums.middle + sums.ring + sums.pinky) / (4 * samples.length),
      };
      
      // Calculate standard deviation for variance awareness
      const variances = { index: 0, middle: 0, ring: 0, pinky: 0, thumb: 0 };
      samples.forEach(s => {
        variances.index += Math.pow(s.fingerCurls.index - averages.index, 2);
        variances.middle += Math.pow(s.fingerCurls.middle - averages.middle, 2);
        variances.ring += Math.pow(s.fingerCurls.ring - averages.ring, 2);
        variances.pinky += Math.pow(s.fingerCurls.pinky - averages.pinky, 2);
        variances.thumb += Math.pow(s.fingerCurls.thumb - averages.thumb, 2);
      });
      
      const stdDevs = {
        index: Math.sqrt(variances.index / samples.length),
        middle: Math.sqrt(variances.middle / samples.length),
        ring: Math.sqrt(variances.ring / samples.length),
        pinky: Math.sqrt(variances.pinky / samples.length),
        thumb: Math.sqrt(variances.thumb / samples.length),
        avgStdDev: (
          Math.sqrt(variances.index / samples.length) +
          Math.sqrt(variances.middle / samples.length) +
          Math.sqrt(variances.ring / samples.length) +
          Math.sqrt(variances.pinky / samples.length)
        ) / 4,
      };
      
      return { ...averages, stdDevs };
    };

    const fistAvg = calcAvgCurls(fistSamples);
    const palmAvg = calcAvgCurls(palmSamples);
    const thumbsUpAvg = calcAvgCurls(thumbsUpSamples);

    console.log('📈 Average curls per gesture:', { fistAvg, palmAvg, thumbsUpAvg });

    // Calculate thresholds based on learned data with standard deviation awareness
    // Use stdDev to add tolerance margins - more variance = more lenient thresholds
    const newThresholds = {
      // Fist detection: threshold between palm and fist
      fistCurlThreshold: palmAvg && fistAvg 
        ? palmAvg.avg + (fistAvg.avg - palmAvg.avg) * 0.5
        : 0.4,
      fistMinFingers: 3,
      
      // Palm detection: slightly above palm average + 1 stdDev for tolerance
      palmExtendThreshold: palmAvg 
        ? Math.min(0.35, palmAvg.avg + 0.1 + (palmAvg.stdDevs?.avgStdDev || 0))
        : 0.3,
      palmThumbMultiplier: 1.5,
      
      // Thumbs up: requires curled fingers but extended thumb
      // Subtract (0.15 + stdDev) to account for natural variance in hand positions
      thumbsUpFingerCurl: thumbsUpAvg 
        ? Math.max(0.45, thumbsUpAvg.avg - 0.15 - (thumbsUpAvg.stdDevs?.avgStdDev || 0) * 0.5)
        : 0.6,
      // Add (0.1 + stdDev) for thumb extension to be more permissive
      thumbsUpThumbExtend: thumbsUpAvg 
        ? Math.min(0.35, thumbsUpAvg.thumb + 0.1 + (thumbsUpAvg.stdDevs?.thumb || 0) * 0.5)
        : 0.25,
      thumbsUpMinFingers: 3,
      thumbsUpYThreshold: 0.05,
      thumbsUpXThreshold: 0.15,
      
      // Store sample data for reference
      _samples: {
        fist: fistSamples.length,
        palm: palmSamples.length,
        thumbsUp: thumbsUpSamples.length,
        thumbsDown: thumbsDownSamples.length,
      },
    };

    console.log('🎓 Learned new thresholds:', newThresholds);
    
    // Save to localStorage
    try {
      localStorage.setItem('gesture-thresholds', JSON.stringify(newThresholds));
      localStorage.setItem('gesture-samples', JSON.stringify({
        fist: fistSamples,
        palm: palmSamples,
        thumbsUp: thumbsUpSamples,
        thumbsDown: thumbsDownSamples,
      }));
      console.log('💾 Saved thresholds to localStorage');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    
    onThresholdsLearned?.(newThresholds);
    
    alert(`Training complete! 🎉\n\nCollected samples:\n• Fist: ${fistSamples.length}\n• Palm: ${palmSamples.length}\n• Thumbs Up: ${thumbsUpSamples.length}\n• Thumbs Down: ${thumbsDownSamples.length}\n\nThresholds saved to localStorage!`);
  }, [samples, onThresholdsLearned]);

  const getSampleCount = (gesture: GestureType) => {
    return samples.get(gesture)?.length || 0;
  };

  const getTotalSamples = () => {
    return Array.from(samples.values()).reduce((sum, arr) => sum + arr.length, 0);
  };

  if (!fingerCurls) {
    return (
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 border border-purple-700/50 max-w-xs">
        <p className="text-white text-sm">👋 Show your hand to start training</p>
      </div>
    );
  }

  return (
    <>
      {/* Finger Curl Display Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-purple-700/50 space-y-2 text-xs">
        <div className="font-bold text-purple-300 mb-2">📊 Finger Curls</div>
        {Object.entries(fingerCurls).map(([finger, value]) => (
          <div key={finger} className="flex items-center gap-2">
            <span className="w-12 text-gray-300 capitalize text-[10px]">{finger}</span>
            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden w-20">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-200"
                style={{ width: `${value * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-gray-300 font-mono text-[10px]">
              {value.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="text-[10px] text-gray-400 pt-1 border-t border-slate-700">
          0.0=Extended • 1.0=Curled
        </div>
      </div>

      {/* Detection & Correction Overlay */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 border border-purple-700/50 max-w-xs space-y-3">
        {/* Current Detection */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Detected Gesture:</div>
          <div className="text-2xl text-center py-2 bg-slate-800/50 rounded-lg">
            {detectedGesture === GestureType.CLOSED_FIST && '✊ Fist'}
            {detectedGesture === GestureType.OPEN_PALM && '🖐️ Palm'}
            {detectedGesture === GestureType.THUMBS_UP && '👍 Thumbs Up'}
            {detectedGesture === GestureType.THUMBS_DOWN && '👎 Thumbs Down'}
            {detectedGesture === GestureType.UNKNOWN && '❓ Unknown'}
          </div>
        </div>

        {/* Training Mode Toggle */}
        {!trainingMode ? (
          <button
            onClick={() => setTrainingMode(true)}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            🎓 Start Training Mode
          </button>
        ) : (
          <>
            {/* Correction Buttons */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Is this wrong? Correct it:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCorrection(GestureType.CLOSED_FIST)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex flex-col items-center"
                >
                  <span className="text-xl">✊</span>
                  <span className="text-[10px]">Fist ({getSampleCount(GestureType.CLOSED_FIST)}/{SAMPLES_NEEDED})</span>
                </button>
                <button
                  onClick={() => handleCorrection(GestureType.OPEN_PALM)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex flex-col items-center"
                >
                  <span className="text-xl">🖐️</span>
                  <span className="text-[10px]">Palm ({getSampleCount(GestureType.OPEN_PALM)}/{SAMPLES_NEEDED})</span>
                </button>
                <button
                  onClick={() => handleCorrection(GestureType.THUMBS_UP)}
                  className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors flex flex-col items-center"
                >
                  <span className="text-xl">👍</span>
                  <span className="text-[10px]">Thumbs ({getSampleCount(GestureType.THUMBS_UP)}/{SAMPLES_NEEDED})</span>
                </button>
                <button
                  onClick={() => handleCorrection(GestureType.THUMBS_DOWN)}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors flex flex-col items-center"
                >
                  <span className="text-xl">👎</span>
                  <span className="text-[10px]">Down ({getSampleCount(GestureType.THUMBS_DOWN)}/{SAMPLES_NEEDED})</span>
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="pt-2 border-t border-slate-700">
              <div className="text-xs text-gray-400 mb-1">
                Training Progress: {getTotalSamples()} / {SAMPLES_NEEDED * 3} samples
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${(getTotalSamples() / (SAMPLES_NEEDED * 3)) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                Make each gesture {SAMPLES_NEEDED} times to improve accuracy
              </div>
            </div>

            {/* Finish Training */}
            {getTotalSamples() >= SAMPLES_NEEDED * 3 && (
              <button
                onClick={learnThresholds}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                ✨ Finish Training & Apply
              </button>
            )}

            {/* Stop Training */}
            <button
              onClick={() => {
                setTrainingMode(false);
                setSamples(new Map());
              }}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors"
            >
              Stop Training
            </button>
          </>
        )}
      </div>
    </>
  );
}

// Simple gesture detection (this is what gets improved by training)
function detectGestureSimple(keypoints: any[], curls: FingerCurlData): GestureType {
  const avgCurl = (curls.index + curls.middle + curls.ring + curls.pinky) / 4;
  
  // Very basic detection
  if (avgCurl > 0.5 && curls.thumb < 0.3) {
    return GestureType.THUMBS_UP;
  }
  if (avgCurl > 0.5) {
    return GestureType.CLOSED_FIST;
  }
  if (avgCurl < 0.3) {
    return GestureType.OPEN_PALM;
  }
  
  return GestureType.UNKNOWN;
}
