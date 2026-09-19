const fs = require('fs');
let code = fs.readFileSync('src/utils/aiVisionEngine.ts', 'utf-8');

const targetLoop = `      let classification = 'object';
      if (p.class === 'person') classification = 'person';
      else if (['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(p.class)) classification = 'vehicle';
      
      observations.push({
        x: px,
        y: py,
        w: pw,
        h: ph,
        cx: px + pw / 2,
        cy: py + ph / 2,
        mass: (pw * ph) * 10,
        classification: classification as 'person' | 'vehicle' | 'object',`;

const newLoop = `      let classification = 'object';
      if (p.class === 'person') classification = 'person';
      else if (['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(p.class)) classification = 'vehicle';
      else if (['bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'].includes(p.class)) classification = 'animal';
      
      observations.push({
        x: px,
        y: py,
        w: pw,
        h: ph,
        cx: px + pw / 2,
        cy: py + ph / 2,
        mass: (pw * ph) * 10,
        classification: classification as 'person' | 'vehicle' | 'animal' | 'object',`;

code = code.replace(targetLoop, newLoop);
fs.writeFileSync('src/utils/aiVisionEngine.ts', code);
console.log("Patched aiVisionEngine.ts");
