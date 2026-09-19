const fs = require('fs');
let code = fs.readFileSync('src/utils/canvasRenderer.ts', 'utf-8');

const isVehicleBlock = `      const isVehicle = target.classification === 'vehicle' || ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(target.cocoClass || '');
      const isAnimal = target.classification === 'animal' || ['bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'].includes(target.cocoClass || '');`;

const newIsVehicleBlock = `      const isVehicle = target.classification === 'vehicle' || target.type === 'vehicle' || ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(target.cocoClass || '');
      const isAnimal = target.classification === 'animal' || target.type === 'animal' || ['bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'].includes(target.cocoClass || '');`;

code = code.replace(isVehicleBlock, newIsVehicleBlock);

const strokeBlock = `      let strokeColor = target.color || '#94a3b8'; // Slate default
      if (target.classification === 'person' || target.isHuman) {
        strokeColor = isAuth ? '#10b981' : (isAnomaly ? '#ef4444' : '#10b981'); // Green for persons (or Red if Anomaly)
      } else if (isVehicle) {
        strokeColor = '#3b82f6'; // Blue for vehicles
      } else if (isAnimal) {
        strokeColor = '#eab308'; // Yellow for animals
      } else if (isAnomaly) {
        strokeColor = '#ef4444'; // Red for non-person anomalies
      }`;
      
const newStrokeBlock = `      let strokeColor = target.color || '#94a3b8'; // Slate default
      if (target.classification === 'person' || target.type === 'person' || target.isHuman) {
        strokeColor = isAuth ? '#10b981' : (isAnomaly ? '#ef4444' : '#10b981'); // Green for persons (or Red if Anomaly)
      } else if (isVehicle) {
        strokeColor = '#3b82f6'; // Blue for vehicles
      } else if (isAnimal) {
        strokeColor = '#eab308'; // Yellow for animals
      } else if (isAnomaly) {
        strokeColor = '#ef4444'; // Red for non-person anomalies
      }`;
      
code = code.replace(strokeBlock, newStrokeBlock);

const fillBlock = `      if (isAnomaly) {
        ctx.fillStyle = 'rgba(185, 28, 28, 0.95)';
      } else if (isAuth || target.classification === 'person') {
        ctx.fillStyle = 'rgba(6, 78, 59, 0.95)'; // Dark Green
      } else if (isVehicle) {
        ctx.fillStyle = 'rgba(30, 58, 138, 0.95)'; // Dark Blue
      } else if (isAnimal) {
        ctx.fillStyle = 'rgba(113, 63, 18, 0.95)'; // Dark Yellow/Brown
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; // Slate
      }`;
      
const newFillBlock = `      if (isAnomaly) {
        ctx.fillStyle = 'rgba(185, 28, 28, 0.95)';
      } else if (isAuth || target.classification === 'person' || target.type === 'person') {
        ctx.fillStyle = 'rgba(6, 78, 59, 0.95)'; // Dark Green
      } else if (isVehicle) {
        ctx.fillStyle = 'rgba(30, 58, 138, 0.95)'; // Dark Blue
      } else if (isAnimal) {
        ctx.fillStyle = 'rgba(113, 63, 18, 0.95)'; // Dark Yellow/Brown
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; // Slate
      }`;
      
code = code.replace(fillBlock, newFillBlock);

const textBlock = `      } else if (target.classification === 'person') {
        tagText = \`[PERSON] \${target.label ? target.label.toUpperCase() : 'UNKNOWN PERSON'} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H // TRK-ID: \${target.trackId || 1}\`;`;
        
const newTextBlock = `      } else if (target.classification === 'person' || target.type === 'person') {
        tagText = \`[PERSON] \${target.label ? target.label.toUpperCase() : 'UNKNOWN PERSON'} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H // TRK-ID: \${target.trackId || 1}\`;`;

code = code.replace(textBlock, newTextBlock);

fs.writeFileSync('src/utils/canvasRenderer.ts', code);
console.log("Patched canvasRenderer.ts for animals and colors 2");
