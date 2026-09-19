const fs = require('fs');
let code = fs.readFileSync('src/utils/webcamVision.ts', 'utf-8');

code = code.replace(
  "const minColThreshold = procHeight * 0.06;",
  "const minColThreshold = procHeight * 0.01; // Drastically lower threshold to catch small motions"
);

code = code.replace(
  "if (clusterWidth >= 8 && clusterMass > minColThreshold * 8) {",
  "if (clusterWidth >= 3 && clusterMass > minColThreshold * 3) {"
);

code = code.replace(
  "if (clusterWidth >= 8 && clusterMass > minColThreshold * 8) {",
  "if (clusterWidth >= 3 && clusterMass > minColThreshold * 3) {"
);

fs.writeFileSync('src/utils/webcamVision.ts', code);
console.log("Patched webcamVision.ts thresholds");
