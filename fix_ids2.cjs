const fs = require('fs');
let camCode = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

camCode = camCode.replace(
  /id: 'anomaly-auto-' \+ Date\.now\(\)/g,
  "id: 'anomaly-auto-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)"
);

fs.writeFileSync('src/components/CameraStream.tsx', camCode);
