const fs = require('fs');
let code = fs.readFileSync('src/utils/temporalTracker.ts', 'utf-8');
code = code.replace(/classification: 'person' \| 'vehicle' \| 'object';/g, "classification: 'person' | 'vehicle' | 'animal' | 'object';");
fs.writeFileSync('src/utils/temporalTracker.ts', code);
console.log("Patched temporalTracker.ts types");

let simCode = fs.readFileSync('src/utils/motionSimulation.ts', 'utf-8');
simCode = simCode.replace(/type: 'person' \| 'vehicle' \| 'drone' \| 'animal' \| 'object';/g, "type: 'person' | 'vehicle' | 'drone' | 'animal' | 'object';"); // unchanged but ensure it's there
fs.writeFileSync('src/utils/motionSimulation.ts', simCode);
