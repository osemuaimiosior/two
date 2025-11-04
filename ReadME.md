Two is a robust cloud-based distributed system solution that enables real-time control and monitoring of autonomous vehicles in the field. 

A scalable, high-performance system that empowers customers to optimize their automated workflows and maximize operational efficiency.

Requirements.

- Architect and lead the development of a sophisticated, cloud-native fleet management system capable of real-time control and monitoring of numerous autonomous vehicles.
- Design and implement scalable, distributed systems that can handle high-volume (parallel processing), real-time data processing (parallel processing) and decision-making.
- Develop robust APIs and microservices to support integration with various autonomous vehicle platforms and customer systems.
- Create efficient algorithms for route optimization, task scheduling, and resource allocation across vehicle fleets.
- Implement advanced data analytics and machine learning capabilities to provide predictive maintenance, performance optimization, and business intelligence features.
- Ensure system reliability, security, and compliance with industry standards and regulations.


// Application flow
Hardware layer (On-fieldfleet) ==> Software layer (gateway==> distributed nodes (brain-box) )

- Brain box (Data processing)
 - Parietal
    - LiDAR (Light Detection and Ranging) => Builds a 3D map of surroundings.
    - Camera (RGB / IR / Stereo) => Detects traffic signs, lanes, pedestrians, and vehicles.
    - GPS / GNSS => Provides global position.
    - IMU (Inertial Measurement Unit) => Tracks acceleration and rotation for dead reckoning.
    - Weather Sensor => Detects conditions affecting perception.
    - Vehicle Telemetry => Reports internal state and controls.