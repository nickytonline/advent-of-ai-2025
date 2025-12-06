#!/usr/bin/env python3
"""
Simple test script to verify MediaPipe installation
"""

import mediapipe as mp
import cv2
import numpy as np

print("=" * 60)
print("MediaPipe Installation Test")
print("=" * 60)

# Check versions
print(f"\nMediaPipe version: {mp.__version__}")
print(f"OpenCV version: {cv2.__version__}")
print(f"NumPy version: {np.__version__}")

# Test MediaPipe solutions availability
print("\n" + "-" * 60)
print("Available MediaPipe Solutions:")
print("-" * 60)

solutions = {
    "Face Detection": hasattr(mp.solutions, 'face_detection'),
    "Face Mesh": hasattr(mp.solutions, 'face_mesh'),
    "Hands": hasattr(mp.solutions, 'hands'),
    "Pose": hasattr(mp.solutions, 'pose'),
    "Holistic": hasattr(mp.solutions, 'holistic'),
    "Objectron": hasattr(mp.solutions, 'objectron'),
    "Selfie Segmentation": hasattr(mp.solutions, 'selfie_segmentation'),
}

for solution, available in solutions.items():
    status = "✓ Available" if available else "✗ Not Available"
    print(f"{solution:<25} {status}")

# Test basic MediaPipe functionality with a simple hands detection setup
print("\n" + "-" * 60)
print("Testing MediaPipe Hands Detection (without webcam):")
print("-" * 60)

try:
    # Initialize MediaPipe Hands
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,
        min_detection_confidence=0.5
    )
    
    # Create a blank test image
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Process the image (should return no detections on blank image)
    results = hands.process(cv2.cvtColor(test_image, cv2.COLOR_BGR2RGB))
    
    print("✓ MediaPipe Hands initialized successfully")
    print(f"  - Test image processed without errors")
    print(f"  - Detections on blank image: {results.multi_hand_landmarks is not None}")
    
    # Clean up
    hands.close()
    
    print("\n✓ All tests passed! MediaPipe is working correctly.")
    
except Exception as e:
    print(f"\n✗ Error during testing: {str(e)}")
    print("MediaPipe may not be configured correctly.")

print("\n" + "=" * 60)
print("Test Complete")
print("=" * 60)
