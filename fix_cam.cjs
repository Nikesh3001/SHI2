const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

const hackLogic = `        const isSimulating = biometricEngine.getOperatorRecognitionMode() === 'SIMULATE_UNKNOWN';
        let humanIndex = 0;
        currentTargets.forEach(target => {
          if (target.isHuman || target.classification === 'object') {
            const isRecognized = isSimulating ? false : (humanIndex === 0);
            
            if (isRecognized) {
              const allMembers = biometricEngine.getMembers();
              const member = allMembers[0] || { id: 'AUTH-1', name: 'AUTHORIZED' };
              target.biometricMatch = {
                isRecognized: true, member, confidence: 0.95, confidencePercent: 95,
                matchedId: member.id, matchedName: member.name, status: 'AUTHORIZED',
                color: '#10b981', displayText: \`✓ [\${member.id}] \${member.name.toUpperCase()} (AUTH)\`
              };
              target.classificationStatus = 'KNOWN';
              target.isAuthorizedTeamMember = true;
              target.isUnknownSubject = false;
              target.color = '#10b981';
              target.label = target.biometricMatch.displayText;
            } else {
              target.biometricMatch = {
                isRecognized: false, member: null, confidence: 0.15, confidencePercent: 15,
                matchedId: null, matchedName: null, status: 'UNREGISTERED_UNKNOWN',
                color: '#ef4444', displayText: '⚠ [RED OBJECT] ANOMALY'
              };
              target.classificationStatus = 'ANOMALY';
              target.isAuthorizedTeamMember = false;
              target.isUnknownSubject = true;
              target.color = '#ef4444';
              target.label = target.biometricMatch.displayText;
            }
            humanIndex++;
          }
        });`;

const originalLogic = `        currentTargets.forEach(target => {
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

code = code.replace(hackLogic, originalLogic);
fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Restored CameraStream.tsx");
