const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

code = code.replace(
  "import { biometricEngine } from '../utils/faceRecognitionEngine';",
  "import { biometricEngine, extractBiometricVectorFromCanvas } from '../utils/faceRecognitionEngine';"
);

const injection = `
      // Extract REAL biometric features if it's the live webcam feed
      if (streamMode === 'webcam' && videoRef.current) {
        // We draw the video onto the canvas to allow pixel extraction
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        currentTargets.forEach(target => {
          if (target.isHuman) {
            const vector = extractBiometricVectorFromCanvas(canvas, target);
            const bioMatch = biometricEngine.recognizeFace(vector);
            target.biometricMatch = bioMatch;
            target.classificationStatus = bioMatch.isRecognized ? 'KNOWN' : 'ANOMALY';
            target.isAuthorizedTeamMember = bioMatch.isRecognized;
            target.isUnknownSubject = !bioMatch.isRecognized;
            target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
            target.label = bioMatch.isRecognized ? bioMatch.displayText : \`⚠ [RED OBJECT] ANOMALY PERSON\`;
          }
        });
      }

      // Render clean C2 military overlay
`;

code = code.replace("      // Render clean C2 military overlay\n", injection);

fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Patched CameraStream.tsx");
