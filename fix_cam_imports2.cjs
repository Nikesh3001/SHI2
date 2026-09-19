const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

code = code.replace(
  "import { updateSimulationStep, TemporalTrackingBuffer } from '../utils/temporalTracker';",
  "import { updateSimulationStep } from '../utils/motionSimulation';\nimport { TemporalTrackingBuffer } from '../utils/temporalTracker';"
);

fs.writeFileSync('src/components/CameraStream.tsx', code);
