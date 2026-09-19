const fs = require('fs');
let code = fs.readFileSync('src/utils/canvasRenderer.ts', 'utf-8');

const oldIsAnomaly = `      const isAnomaly = Boolean(
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
      );`;

const newIsAnomaly = `      const isVehicle = target.classification === 'vehicle' || ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(target.cocoClass || '');
      
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
      );`;
code = code.replace(oldIsAnomaly, newIsAnomaly);

const oldTagText = `      if (isAuth) {
        tagText = \`✓ [\${target.memberId || target.biometricMatch?.matchedId || 'AUTH-ID'}] \${(target.memberName || target.biometricMatch?.matchedName || 'AUTHORIZED MEMBER').toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`FUSION [YOLO+LiDAR]: MOVING PERSON // AUTH TEAM // \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      } else if (isAnomaly) {
        tagText = \`⚠ [RED OBJECT] ANOMALY PERSON \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`FUSION [YOLO+LiDAR]: MOVING PERSON // UNREGISTERED // \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      } else if (target.classification === 'vehicle' || target.cocoClass === 'car' || target.cocoClass === 'truck' || target.cocoClass === 'bus' || target.cocoClass === 'motorcycle') {
        tagText = \`[VEHICLE] \${target.label ? target.label.toUpperCase() : (target.cocoClass || 'TARGET').toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H // TRK-ID: \${target.trackId || 1}\`;
      } else {
        tagText = target.label
          ? \`\${target.label.toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`
          : \`TARGET #\${target.trackId || 1} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = \`SPEED: \${(target.speedKmh || 0).toFixed(1)} KM/H\`;
      }`;
      
const newTagText = `      if (isAuth) {
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
code = code.replace(oldTagText, newTagText);

fs.writeFileSync('src/utils/canvasRenderer.ts', code);
console.log("Patched canvasRenderer.ts for vehicles");
