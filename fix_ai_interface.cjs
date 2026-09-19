const fs = require('fs');
let code = fs.readFileSync('src/utils/aiVisionEngine.ts', 'utf-8');
code = code.replace(/Observation/g, 'DetectionObservation');
fs.writeFileSync('src/utils/aiVisionEngine.ts', code);
