export const liDARDataProcessing = async (payload) => {
    // sample payload data
    // {
    //     "timestamp": 1730191823.523;
    //     "points": [
    //         {"x": 12.45, "y": -3.22, "z": 1.8, "intensity": 0.76},
    //         {"x": 11.02, "y": -2.85, "z": 1.75, "intensity": 0.68}
    //     ]
    // }
};

export const cameraDataProcessing = async (payload) => {
    // sample payload data
    // {
    //   "timestamp": 1730191823.541,
    //   "camera_id": "front_center",
    //   "image": "base64encodedimage...",
    //   "objects_detected": [
    //     {"label": "car", "confidence": 0.94, "bbox": [312, 245, 480, 390]},
    //     {"label": "pedestrian", "confidence": 0.88, "bbox": [190, 230, 220, 360]}
    //   ]
    // }
};