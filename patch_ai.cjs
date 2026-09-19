const fs = require('fs');
let code = fs.readFileSync('src/utils/aiVisionEngine.ts', 'utf-8');

const targetLoop = `      observations.push({
        x: px,
        y: py,
        w: pw,
        h: ph,
        cx: px + pw / 2,
        cy: py + ph / 2,
        mass: (pw * ph) * 10,
        classification: p.class === 'person' ? 'person' : 'object',
        cocoClass: p.class,
        cocoId: p.class === 'person' ? 1 : 99,
        isHuman: p.class === 'person',
        confidence: p.score,
        hasFace: p.class === 'person'
      });`;

const newLoop = `      
      let classification = 'object';
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
        classification: classification as 'person' | 'vehicle' | 'object',
        cocoClass: p.class as any,
        cocoId: p.class === 'person' ? 1 : 99,
        isHuman: p.class === 'person',
        confidence: p.score,
        hasFace: p.class === 'person'
      });`;

code = code.replace(targetLoop, newLoop);
fs.writeFileSync('src/utils/aiVisionEngine.ts', code);
console.log("Patched aiVisionEngine.ts");
