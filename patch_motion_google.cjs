const fs = require('fs');
let code = fs.readFileSync('src/utils/motionSimulation.ts', 'utf-8');

code = code.replace(/#ef4444/g, '#EA4335');

fs.writeFileSync('src/utils/motionSimulation.ts', code);
console.log("Patched motionSimulation.ts for Google Red");
