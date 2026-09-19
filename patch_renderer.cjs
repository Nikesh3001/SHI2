const fs = require('fs');
let code = fs.readFileSync('src/utils/canvasRenderer.ts', 'utf-8');

const targetTagLogic = `      if (isAuth) {
        tagText = \`✓ [\${target.memberId || target.biometricMatch?.matchedId || 'AUTH-ID'}] \${(target.memberName || target.biometricMatch?.matchedName || 'AUTHORIZED MEMBER').toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = 'FUSION [YOLO+LiDAR]: MOVING PERSON // AUTH TEAM';
      } else if (isAnomaly) {
        tagText = \`⚠ [RED OBJECT] ANOMALY PERSON \${(target.confidence * 100).toFixed(0)}%\`;
        subTagText = 'FUSION [YOLO+LiDAR]: MOVING PERSON // UNREGISTERED';
      } else {
        tagText = target.label
          ? \`\${target.label.toUpperCase()} \${(target.confidence * 100).toFixed(0)}%\`
          : \`TARGET #\${target.trackId || 1} \${(target.confidence * 100).toFixed(0)}%\`;
      }`;

const newTagLogic = `      if (isAuth) {
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
code = code.replace(targetTagLogic, newTagLogic);

// Add velocity vector drawing
const bracketLogic = `      // Authentic Military Reticle Corner Brackets (┌ ┐ └ ┘)
      const bracketLen = Math.min(12, bw * 0.3, bh * 0.3);`;

const newBracketLogic = `      // Dynamic Velocity Vector visualization
      if ((target.vx !== 0 || target.vy !== 0) && (target.speedKmh || 0) > 0.1) {
        const vxPx = (target.vx / 100) * w;
        const vyPx = (target.vy / 100) * h;
        
        ctx.beginPath();
        const centerXPx = cx + bw / 2;
        const centerYPx = cy + bh / 2;
        ctx.moveTo(centerXPx, centerYPx);
        ctx.lineTo(centerXPx + vxPx * 1.5, centerYPx + vyPx * 1.5);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerXPx + vxPx * 1.5, centerYPx + vyPx * 1.5, 2, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.setLineDash([]);
      }

      // Authentic Military Reticle Corner Brackets (┌ ┐ └ ┘)
      const bracketLen = Math.min(12, bw * 0.3, bh * 0.3);`;
code = code.replace(bracketLogic, newBracketLogic);

fs.writeFileSync('src/utils/canvasRenderer.ts', code);
console.log("Patched canvasRenderer.ts");
