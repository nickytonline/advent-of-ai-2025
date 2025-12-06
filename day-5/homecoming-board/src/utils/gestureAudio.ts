/**
 * Gesture Audio Utilities
 * 
 * Plays sounds for gesture changes with caching
 */

import { GestureType } from './gestureDetection';

// Map to cache loaded audio files
const sounds = new Map<string, HTMLAudioElement>();

// Gesture sound mappings
const GESTURE_SOUNDS: Record<GestureType, string | null> = {
  [GestureType.CLOSED_FIST]: '/sounds/whoosh.mp3',
  [GestureType.OPEN_PALM]: '/sounds/chime.mp3',
  [GestureType.THUMBS_UP]: '/sounds/ding.mp3',
  [GestureType.THUMBS_DOWN]: '/sounds/buzz.mp3',
  [GestureType.UNKNOWN]: null, // No sound for unknown gestures
};

// Global sound enabled state (can be controlled externally)
let soundEnabled = true;

/**
 * Set whether sounds should be enabled
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/**
 * Get current sound enabled state
 */
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Play sound for a gesture
 * Caches audio files to avoid reloading
 */
export function playGestureSound(gesture: GestureType): void {
  // Check if sounds are enabled
  if (!soundEnabled) {
    return;
  }

  const soundFile = GESTURE_SOUNDS[gesture];
  
  // No sound for this gesture
  if (!soundFile) {
    return;
  }

  // Load and cache audio if not already loaded
  if (!sounds.has(soundFile)) {
    const audio = new Audio(soundFile);
    audio.volume = 0.5; // Set reasonable volume
    sounds.set(soundFile, audio);
  }

  const audio = sounds.get(soundFile)!;
  
  // Reset to start and play
  audio.currentTime = 0;
  audio.play().catch(err => {
    // Ignore errors (e.g., user hasn't interacted with page yet)
    console.debug('Audio play prevented:', err);
  });
}

/**
 * Preload all gesture sounds
 * Call this on user interaction to prepare audio
 */
export function preloadGestureSounds(): void {
  Object.values(GESTURE_SOUNDS).forEach(soundFile => {
    if (soundFile && !sounds.has(soundFile)) {
      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      sounds.set(soundFile, audio);
    }
  });
}

/**
 * Set volume for all gesture sounds
 */
export function setGestureSoundVolume(volume: number): void {
  sounds.forEach(audio => {
    audio.volume = Math.max(0, Math.min(1, volume));
  });
}
