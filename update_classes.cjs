const fs = require('fs');

let trackerCode = fs.readFileSync('src/utils/temporalTracker.ts', 'utf-8');
trackerCode = trackerCode.replace(/classification: 'person' \| 'object';/g, "classification: 'person' | 'vehicle' | 'object';");
fs.writeFileSync('src/utils/temporalTracker.ts', trackerCode);

let cocoCode = fs.readFileSync('src/utils/cocoLabels.ts', 'utf-8');
if (!cocoCode.includes("'vehicle'")) {
  cocoCode = cocoCode.replace(/export type DetectionClassFilter/g, `
export function isVehicleClass(className: CocoClassName): boolean {
  return ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'train', 'airplane', 'boat'].includes(className);
}
export type DetectionClassFilter`);
  fs.writeFileSync('src/utils/cocoLabels.ts', cocoCode);
}
