const fs = require('fs');
let code = fs.readFileSync('src/data/mockData.ts', 'utf-8');

code = code.replace(
`  {
    id: 'cam-01',
    name: 'Border Outpost Gate',
    code: 'CAM-01',
    sector: 'Sector Alpha',
    bopName: 'Gate Checkpoint',
    type: 'fixed',
    rtspUrl: cam01,
    onvifProfile: 'Profile S',
    ipAddress: '10.14.88.21',
    status: 'online',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    fovHeading: 285,
    fovAngle: 75,
    lat: 32.7266,
    lng: 74.8570,
    altitudeMeters: 412,
    nightVisionSupported: true,
    thermalSupported: false,
    virtualFences: [],
    activeDetections: []
  },`,
`  {
    id: 'cam-01',
    name: 'Local Biometric Sentry (Webcam)',
    code: 'CAM-01',
    sector: 'Sector Alpha',
    bopName: 'HQ Checkpoint',
    type: 'fixed',
    rtspUrl: cam01,
    onvifProfile: 'Profile S',
    ipAddress: '10.14.88.21',
    status: 'online',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    fovHeading: 285,
    fovAngle: 75,
    lat: 32.7266,
    lng: 74.8570,
    altitudeMeters: 412,
    nightVisionSupported: true,
    thermalSupported: false,
    streamMode: 'webcam',
    virtualFences: [],
    activeDetections: []
  },`
);

fs.writeFileSync('src/data/mockData.ts', code);
