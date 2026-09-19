const fs = require('fs');
let code = fs.readFileSync('src/utils/canvasRenderer.ts', 'utf-8');

// Replace all #ef4444 (Tailwind red-500) and rgba(239, 68, 68, X) with Google Red #EA4335
code = code.replace(/#ef4444/g, '#EA4335');
code = code.replace(/rgba\(239, 68, 68, /g, 'rgba(234, 67, 53, ');

// Replace the anomaly background color rgba(185, 28, 28, 0.95) with Google Red
code = code.replace(/rgba\(185, 28, 28, 0\.95\)/g, 'rgba(234, 67, 53, 0.95)');

fs.writeFileSync('src/utils/canvasRenderer.ts', code);
console.log("Patched canvasRenderer.ts for Google Red");

let faceCode = fs.readFileSync('src/utils/faceRecognitionEngine.ts', 'utf-8');
faceCode = faceCode.replace(/#ef4444/g, '#EA4335');
fs.writeFileSync('src/utils/faceRecognitionEngine.ts', faceCode);

let temporalCode = fs.readFileSync('src/utils/temporalTracker.ts', 'utf-8');
temporalCode = temporalCode.replace(/#ef4444/g, '#EA4335');
fs.writeFileSync('src/utils/temporalTracker.ts', temporalCode);
