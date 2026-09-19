const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

code = code.replace(/#ef4444/g, '#EA4335');

fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Patched CameraStream.tsx for Google Red");
