const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

if (!code.includes('lastTrackResultRef')) {
  code = code.replace(
    /const trackerRef = useRef<any>\(null\);/,
    "const trackerRef = useRef<any>(null);\n  const lastTrackResultRef = useRef<any>(null);"
  );
  
  // inside interval
  code = code.replace(
    /const trackResult = trackerRef\.current\.update\(observations, dt, \[\], \{ personOnly: false, allowedClasses: \[\] \}\);/,
    "const trackResult = trackerRef.current.update(observations, dt, [], { personOnly: false, allowedClasses: [] });\n        lastTrackResultRef.current = trackResult;"
  );
  
  // inside enroll
  code = code.replace(
    /const trackResult = \{ targets: trackerRef\.current\.getTracks \? trackerRef\.current\.getTracks\(\) : \[\] \};/,
    "const trackResult = lastTrackResultRef.current || { targets: [] };"
  );
  
  fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
  console.log("Patched TeamBiometricsView enroll state!");
}
