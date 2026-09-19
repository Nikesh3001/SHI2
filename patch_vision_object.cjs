const fs = require('fs');
let code = fs.readFileSync('src/utils/webcamVision.ts', 'utf-8');

code = code.replace(
  "if (ph < 7 && clusterPixelCount < 70) {",
  "if (ph < 2 && clusterPixelCount < 5) {"
);

fs.writeFileSync('src/utils/webcamVision.ts', code);
console.log("Patched object threshold");
