const fs = require('fs');
let code = fs.readFileSync('src/utils/faceRecognitionEngine.ts', 'utf-8');

const oldDraw = `    if (box && 'videoWidth' in sourceCanvas) {
      const vw = sourceCanvas.videoWidth || 640;
      const vh = sourceCanvas.videoHeight || 480;
      const sx = (box.x / 100) * vw;
      const sy = (box.y / 100) * vh;
      const sw = (box.w / 100) * vw;
      const sh = (box.h / 100) * vh;
      ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, 64, 64);
    } else {
      ctx.drawImage(sourceCanvas, 0, 0, 64, 64);
    }`;

const newDraw = `    if (box) {
      const vw = ('videoWidth' in sourceCanvas) ? sourceCanvas.videoWidth : sourceCanvas.width;
      const vh = ('videoHeight' in sourceCanvas) ? sourceCanvas.videoHeight : sourceCanvas.height;
      const sx = (box.x / 100) * vw;
      const sy = (box.y / 100) * vh;
      const sw = (box.w / 100) * vw;
      const sh = (box.h / 100) * vh;
      ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, 64, 64);
    } else {
      ctx.drawImage(sourceCanvas, 0, 0, 64, 64);
    }`;

code = code.replace(oldDraw, newDraw);
fs.writeFileSync('src/utils/faceRecognitionEngine.ts', code);
console.log("Patched faceRecognitionEngine.ts");
