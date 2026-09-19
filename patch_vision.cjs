const fs = require('fs');
let code = fs.readFileSync('src/utils/webcamVision.ts', 'utf-8');

const oldLogic = `        const skinRatio = sampledPixels > 0 ? (skinPixelCount / sampledPixels) : 0;
        const hasHumanSkin = skinRatio > 0.08;
        const isVerticallyElongated = (pixelHeight / pixelWidth) >= 1.15;
        const hasHumanHeight = ph >= 20;

        const isPerson = Boolean(faceMatch) || (hasHumanSkin && isVerticallyElongated && hasHumanHeight);

        if (isPerson) {
          pw = Math.max(14, Math.min(38, pw));
          ph = Math.max(26, Math.min(94, ph));
          const adjustedX = Math.max(0, Math.min(100 - pw, cx - pw / 2));
          const adjustedY = Math.max(0, Math.min(100 - ph, cy - ph / 2));`;

const newLogic = `        const skinRatio = sampledPixels > 0 ? (skinPixelCount / sampledPixels) : 0;
        const hasHumanSkin = skinRatio > 0.01; // Relaxed skin requirement
        const isVerticallyElongated = (pixelHeight / pixelWidth) >= 0.7; // Relaxed aspect ratio
        const hasHumanHeight = ph >= 12; // Relaxed height

        // If it moves and has a decent size, we assume it's a person or object of interest in security context
        const isPerson = Boolean(faceMatch) || (hasHumanHeight && (hasHumanSkin || isVerticallyElongated));

        if (isPerson) {
          pw = Math.max(8, Math.min(70, pw));
          ph = Math.max(15, Math.min(98, ph));
          const adjustedX = Math.max(0, Math.min(100 - pw, cx - pw / 2));
          const adjustedY = Math.max(0, Math.min(100 - ph, cy - ph / 2));`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/utils/webcamVision.ts', code);
console.log("Patched webcamVision.ts");
