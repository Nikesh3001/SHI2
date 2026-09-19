const fs = require('fs');
let code = fs.readFileSync('src/utils/webcamVision.ts', 'utf-8');

const oldLogic = `        const skinRatio = sampledPixels > 0 ? (skinPixelCount / sampledPixels) : 0;
        const hasHumanSkin = skinRatio > 0.01; // Relaxed skin requirement
        const isVerticallyElongated = (pixelHeight / pixelWidth) >= 0.7; // Relaxed aspect ratio
        const hasHumanHeight = ph >= 12; // Relaxed height

        // If it moves and has a decent size, we assume it's a person or object of interest in security context
        const isPerson = Boolean(faceMatch) || (hasHumanHeight && (hasHumanSkin || isVerticallyElongated));`;

const newLogic = `        const skinRatio = sampledPixels > 0 ? (skinPixelCount / sampledPixels) : 0;
        const hasHumanSkin = skinRatio > 0.01; // Relaxed skin requirement
        const isVerticallyElongated = (pixelHeight / pixelWidth) >= 0.7; // Relaxed aspect ratio
        const hasHumanHeight = ph >= 12; // Relaxed height

        // FORCE ALL motion to be detected as a person/object of interest for robust local webcam demo
        const isPerson = true;`;

code = code.replace(oldLogic, newLogic);

// Also lower the minimum pixel threshold so it detects even slight motion
code = code.replace(
`        // Noise suppression: Ignore tiny desk movements
        if (clusterPixelCount < 40 || maxY <= minY || (maxY - minY + 1) < 12) {`,
`        // Noise suppression: Ignore tiny desk movements
        if (clusterPixelCount < 10 || maxY <= minY || (maxY - minY + 1) < 5) {`
);

fs.writeFileSync('src/utils/webcamVision.ts', code);
console.log("Patched webcamVision.ts to track ALL motion as target");
