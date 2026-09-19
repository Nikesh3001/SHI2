const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

code = code.replace(
  "if (now - lastBreachAlertThrottleRef.current > 4000) {",
  "if (now - lastBreachAlertThrottleRef.current > 15000) {"
);

fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Patched throttle");
