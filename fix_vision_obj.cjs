const fs = require('fs');
let code = fs.readFileSync('src/utils/webcamVision.ts', 'utf-8');

const oldLogic = `        // FORCE ALL motion to be detected as a person/object of interest for robust local webcam demo
        const isPerson = true;`;

const newLogic = `        // Dynamic distinction between PERSON and OBJECT
        // A person is typically vertically elongated or has skin tone, or is a large moving mass.
        // A small, non-elongated moving mass is an OBJECT (e.g., cup, backpack, drone).
        const isPerson = Boolean(faceMatch) || (hasHumanHeight && (hasHumanSkin || isVerticallyElongated || clusterPixelCount > 400));`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/utils/webcamVision.ts', code);
console.log("Restored dynamic person vs object logic");
