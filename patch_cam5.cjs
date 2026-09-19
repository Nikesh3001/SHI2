const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

const oldLogic = `            // Force authorization for demo to make the team detectable (green), UNLESS simulating intruder
            const isIntruderSim = biometricEngine.getOperatorRecognitionMode() === 'SIMULATE_UNKNOWN';
            
            if (isIntruderSim) {
              target.biometricMatch = {
                isRecognized: false,
                member: null,
                confidence: 0.22,
                confidencePercent: 22,
                matchedId: null,
                matchedName: null,
                status: 'UNREGISTERED_UNKNOWN',
                color: '#ef4444',
                displayText: '⚠ [RED OBJECT] ANOMALY PERSON: UNREGISTERED'
              };
              target.classificationStatus = 'ANOMALY';
              target.isAuthorizedTeamMember = false;
              target.isUnknownSubject = true;
              target.color = '#ef4444';
              target.label = target.biometricMatch.displayText;
            } else {
              const allMembers = biometricEngine.getMembers();
              const stableIndex = (target.trackId || 0) % (allMembers.length || 1);
              const assignedMember = allMembers[stableIndex] || { id: 'AUTH-1', name: 'AUTHORIZED PERSONNEL' };
              
              target.biometricMatch = {
                isRecognized: true,
                member: assignedMember,
                confidence: 0.92 + Math.random() * 0.05,
                confidencePercent: Math.floor(92 + Math.random() * 5),
                matchedId: assignedMember.id,
                matchedName: assignedMember.name,
                status: 'AUTHORIZED',
                color: '#10b981',
                displayText: \`✓ [\${assignedMember.id}] \${assignedMember.name.toUpperCase()} (AUTH)\`
              };
              target.classificationStatus = 'KNOWN';
              target.isAuthorizedTeamMember = true;
              target.isUnknownSubject = false;
              target.color = '#10b981';
              target.label = target.biometricMatch.displayText;
            }`;

const newLogic = `            // Dynamic detection for demo: mix of known (green) and unknown (red) based on track ID
            const isIntruderSim = biometricEngine.getOperatorRecognitionMode() === 'SIMULATE_UNKNOWN';
            let isRecognized = true;
            
            if (isIntruderSim) {
                isRecognized = false;
            } else {
                // Primary person (trackId 1, 3, etc.) is Known (Green), secondary person (trackId 2, 4) is Anomaly (Red)
                isRecognized = (target.trackId || 1) % 2 !== 0;
            }
            
            if (!isRecognized) {
              target.biometricMatch = {
                isRecognized: false,
                member: null,
                confidence: 0.22 + Math.random() * 0.1,
                confidencePercent: Math.floor(22 + Math.random() * 10),
                matchedId: null,
                matchedName: null,
                status: 'UNREGISTERED_UNKNOWN',
                color: '#ef4444',
                displayText: '⚠ [RED OBJECT] ANOMALY PERSON: UNREGISTERED'
              };
              target.classificationStatus = 'ANOMALY';
              target.isAuthorizedTeamMember = false;
              target.isUnknownSubject = true;
              target.color = '#ef4444';
              target.label = target.biometricMatch.displayText;
            } else {
              const allMembers = biometricEngine.getMembers();
              const stableIndex = (target.trackId || 0) % (allMembers.length || 1);
              const assignedMember = allMembers[stableIndex] || { id: 'AUTH-1', name: 'AUTHORIZED PERSONNEL' };
              
              target.biometricMatch = {
                isRecognized: true,
                member: assignedMember,
                confidence: 0.92 + Math.random() * 0.05,
                confidencePercent: Math.floor(92 + Math.random() * 5),
                matchedId: assignedMember.id,
                matchedName: assignedMember.name,
                status: 'AUTHORIZED',
                color: '#10b981',
                displayText: \`✓ [\${assignedMember.id}] \${assignedMember.name.toUpperCase()} (AUTH)\`
              };
              target.classificationStatus = 'KNOWN';
              target.isAuthorizedTeamMember = true;
              target.isUnknownSubject = false;
              target.color = '#10b981';
              target.label = target.biometricMatch.displayText;
            }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Patched CameraStream.tsx");
