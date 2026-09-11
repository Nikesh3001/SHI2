const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

code = code.replace(
`      if (streamMode === 'webcam' && videoRef.current) {`,
`      if (streamMode === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {`
);

fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Patched CameraStream.tsx");
