const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

const oldLogic = `        currentTargets.forEach(target => {
          if (target.isHuman || target.classification === 'object') {
            const vector = extractBiometricVectorFromCanvas(canvas, target);
            const bioMatch = biometricEngine.recognizeFace(vector, undefined, target.trackId);
            target.biometricMatch = bioMatch;
            target.classificationStatus = bioMatch.isRecognized ? 'KNOWN' : 'ANOMALY';
            target.isAuthorizedTeamMember = bioMatch.isRecognized;
            target.isUnknownSubject = !bioMatch.isRecognized;
            target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
            target.label = bioMatch.isRecognized ? bioMatch.displayText : \`⚠ [RED OBJECT] ANOMALY PERSON\`;
          }
        });`;

const newLogic = `        currentTargets.forEach(target => {
          if (target.isHuman) {
            const vector = extractBiometricVectorFromCanvas(canvas, target);
            const bioMatch = biometricEngine.recognizeFace(vector, undefined, target.trackId);
            target.biometricMatch = bioMatch;
            target.classificationStatus = bioMatch.isRecognized ? 'KNOWN' : 'ANOMALY';
            target.isAuthorizedTeamMember = bioMatch.isRecognized;
            target.isUnknownSubject = !bioMatch.isRecognized;
            target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
            target.label = bioMatch.isRecognized ? bioMatch.displayText : \`⚠ [RED OBJECT] ANOMALY PERSON\`;
          }
        });`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Fixed CameraStream target human check");
