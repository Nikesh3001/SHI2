const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

const target = "import { initAiVisionModel, detectObjects } from '../utils/aiVisionEngine';\\nimport { updateSimulationStep } from '../utils/motionSimulation';\\nimport { TemporalTrackingBuffer } from '../utils/temporalTracker';";
const replacement = "import { initAiVisionModel, detectObjects } from '../utils/aiVisionEngine';\\nimport { TemporalTrackingBuffer } from '../utils/temporalTracker';";

// If string literal isn't exact, just remove the line via regex
code = code.replace(/import \{ updateSimulationStep \} from '\.\.\/utils\/motionSimulation';\nimport \{ TemporalTrackingBuffer \}/, "import { TemporalTrackingBuffer }");

fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Fixed duplicate import");
