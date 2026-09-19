const fs = require('fs');
let code = fs.readFileSync('src/utils/canvasRenderer.ts', 'utf-8');

const isAnomalyBlock = `      const isVehicle = target.classification === 'vehicle' || ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(target.cocoClass || '');
      
      const isAnomaly = Boolean(
        !isVehicle && (
          target.classificationStatus === 'ANOMALY' ||
          target.isUnknownSubject || 
          isBreaching || 
          target.color === '#ef4444' || 
          target.label?.toLowerCase().includes('anomaly') || 
          target.label?.toLowerCase().includes('unregistered') || 
          target.label?.toLowerCase().includes('infiltrat') || 
          target.label?.toLowerCase().includes('trespass') || 
          (target.isHuman && !isAuth) || 
          (target.type === 'person' && !isAuth) ||
          (target.classification === 'person' && !isAuth)
        )
      );

      // Strict user rule:
      // Authorized 6 team members (Nikesh Reddy & team) -> Green (#10b981)
      // EXCEPT US: Anomaly persons, strangers, and intruders -> RED SQUARE OBJECT (#ef4444)
      const strokeColor = isAuth 
        ? '#10b981' 
        : (isAnomaly ? '#ef4444' : (target.color || '#38bdf8'));`;

const newIsAnomalyBlock = `      const isVehicle = target.classification === 'vehicle' || ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(target.cocoClass || '');
      const isAnimal = target.classification === 'animal' || ['bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'].includes(target.cocoClass || '');
      
      const isAnomaly = Boolean(
        !isVehicle && !isAnimal && (
          target.classificationStatus === 'ANOMALY' ||
          target.isUnknownSubject || 
          isBreaching || 
          target.color === '#ef4444' || 
          target.label?.toLowerCase().includes('anomaly') || 
          target.label?.toLowerCase().includes('unregistered') || 
          target.label?.toLowerCase().includes('infiltrat') || 
          target.label?.toLowerCase().includes('trespass') || 
          (target.isHuman && !isAuth) || 
          (target.type === 'person' && !isAuth) ||
          (target.classification === 'person' && !isAuth)
        )
      );

      let strokeColor = target.color || '#94a3b8'; // Slate default
      if (target.classification === 'person' || target.isHuman) {
        strokeColor = isAuth ? '#10b981' : (isAnomaly ? '#ef4444' : '#10b981'); // Green for persons (or Red if Anomaly)
      } else if (isVehicle) {
        strokeColor = '#3b82f6'; // Blue for vehicles
      } else if (isAnimal) {
        strokeColor = '#eab308'; // Yellow for animals
      } else if (isAnomaly) {
        strokeColor = '#ef4444'; // Red for non-person anomalies
      }`;

code = code.replace(isAnomalyBlock, newIsAnomalyBlock);

const tagsBlock = `      if (isAuth) {
        tagText = \`✓ [\${target.memberId || target.biometricMatch?.matchedId || 'AUTH-ID'}] \${(target.memberName || target.biometricMatch?.matchedName || 'AUTHORIZED MEMBER').toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`FUSION [YOLO+LiDAR]: MOVING PERSON // AUTH TEAM // \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      } else if (isAnomaly) {
        tagText = \`⚠ [RED OBJECT] ANOMALY PERSON \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`FUSION [YOLO+LiDAR]: MOVING PERSON // UNREGISTERED // \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      } else if (isVehicle) {
        tagText = \`[VEHICLE] \${target.label ? target.label.toUpperCase() : (target.cocoClass || 'TARGET').toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H // TRK-ID: \${target.trackId || 1}\`;
      } else {
        tagText = target.label
          ? \`\${target.label.toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`
          : \`TARGET #\${target.trackId || 1} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      }`;

const newTagsBlock = `      if (isAuth) {
        tagText = \`✓ [\${target.memberId || target.biometricMatch?.matchedId || 'AUTH-ID'}] \${(target.memberName || target.biometricMatch?.matchedName || 'AUTHORIZED MEMBER').toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`FUSION [YOLO+LiDAR]: MOVING PERSON // AUTH TEAM // \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      } else if (isAnomaly) {
        tagText = \`⚠ [RED OBJECT] ANOMALY PERSON \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`FUSION [YOLO+LiDAR]: MOVING PERSON // UNREGISTERED // \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      } else if (isVehicle) {
        tagText = \`[VEHICLE] \${target.label ? target.label.toUpperCase() : (target.cocoClass || 'TARGET').toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H // TRK-ID: \${target.trackId || 1}\`;
      } else if (isAnimal) {
        tagText = \`[ANIMAL] \${target.label ? target.label.toUpperCase() : (target.cocoClass || 'TARGET').toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H // TRK-ID: \${target.trackId || 1}\`;
      } else if (target.classification === 'person') {
        tagText = \`[PERSON] \${target.label ? target.label.toUpperCase() : 'UNKNOWN PERSON'} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H // TRK-ID: \${target.trackId || 1}\`;
      } else {
        tagText = target.label
          ? \`\${target.label.toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`
          : \`[OBJECT] \${(target.cocoClass || 'TARGET').toUpperCase()} #\${target.trackId || 1} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      }`;

code = code.replace(tagsBlock, newTagsBlock);

// Also patch the label color so it matches stroke color
const fillStyleBlock = `      ctx.fillStyle = isAnomaly 
        ? 'rgba(185, 28, 28, 0.95)' 
        : (isAuth ? 'rgba(6, 78, 59, 0.95)' : (isBreaching ? 'rgba(185, 28, 28, 0.9)' : 'rgba(15, 23, 42, 0.9)'));`;

const newFillStyleBlock = `      if (isAnomaly) {
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

code = code.replace(fillStyleBlock, newFillStyleBlock);

fs.writeFileSync('src/utils/canvasRenderer.ts', code);
console.log("Patched canvasRenderer.ts for animals and colors");
