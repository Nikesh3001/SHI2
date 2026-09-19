const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

if (!code.includes('initAiVisionModel')) {
  code = code.replace(
    /import \{ renderTacticalSimulation \} from '\.\.\/utils\/canvasRenderer';/,
    "import { renderTacticalSimulation } from '../utils/canvasRenderer';\nimport { initAiVisionModel, detectObjects } from '../utils/aiVisionEngine';\nimport { updateSimulationStep } from '../utils/temporalTracker';"
  );
  fs.writeFileSync('src/components/CameraStream.tsx', code);
  console.log("Patched CameraStream imports");
}
