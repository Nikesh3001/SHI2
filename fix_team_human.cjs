const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

const oldLogic = `        trackResult.targets.forEach((target: any) => {
          if (target.isHuman || target.classification === 'object') {
             const vector = extractBiometricVectorFromCanvas(canvas, target);
             const bioMatch = biometricEngine.recognizeFace(vector, undefined, target.trackId);
             target.biometricMatch = bioMatch;
             target.classificationStatus = bioMatch.isRecognized ? 'KNOWN' : 'ANOMALY';
             target.isAuthorizedTeamMember = bioMatch.isRecognized;
             target.isUnknownSubject = !bioMatch.isRecognized;
             target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
             target.label = bioMatch.isRecognized ? bioMatch.displayText : \`⚠ [RED OBJECT] ANOMALY PERSON\`;
             if (!primaryResult) primaryResult = bioMatch;
          }
        });`;

const newLogic = `        trackResult.targets.forEach((target: any) => {
          if (target.isHuman) {
             const vector = extractBiometricVectorFromCanvas(canvas, target);
             const bioMatch = biometricEngine.recognizeFace(vector, undefined, target.trackId);
             target.biometricMatch = bioMatch;
             target.classificationStatus = bioMatch.isRecognized ? 'KNOWN' : 'ANOMALY';
             target.isAuthorizedTeamMember = bioMatch.isRecognized;
             target.isUnknownSubject = !bioMatch.isRecognized;
             target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
             target.label = bioMatch.isRecognized ? bioMatch.displayText : \`⚠ [RED OBJECT] ANOMALY PERSON\`;
             if (!primaryResult) primaryResult = bioMatch;
          }
        });`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
console.log("Fixed TeamBiometricsView target human check");
