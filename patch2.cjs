const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

// We need to import createOpticalMotionTracker and renderTacticalSimulation
code = code.replace(
  "import {\n  biometricEngine,",
  "import { createOpticalMotionTracker } from '../utils/webcamVision';\nimport { renderTacticalSimulation } from '../utils/canvasRenderer';\nimport {\n  biometricEngine,"
);

const opticalLogic = `
  const trackerRef = useRef<any>(null);
  if (!trackerRef.current) {
    trackerRef.current = createOpticalMotionTracker();
  }

  // Live Camera Scan Loop
  useEffect(() => {
    let animationFrameId: number;
    let scanInterval: any;

    if (isLiveChamberActive && webcamStream) {
      scanInterval = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.readyState < 2) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Process frame for multiple objects and people
        const trackResult = trackerRef.current.processFrame(video, [], 22, undefined, { personOnly: false, allowedClasses: [] });
        
        let primaryResult: any = null;

        trackResult.targets.forEach((target: any) => {
          if (target.isHuman) {
             const vector = extractBiometricVectorFromCanvas(canvas, target);
             const bioMatch = biometricEngine.recognizeFace(vector);
             target.biometricMatch = bioMatch;
             target.classificationStatus = bioMatch.isRecognized ? 'KNOWN' : 'ANOMALY';
             target.isAuthorizedTeamMember = bioMatch.isRecognized;
             target.isUnknownSubject = !bioMatch.isRecognized;
             target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
             target.label = bioMatch.isRecognized ? bioMatch.displayText : \`⚠ [RED OBJECT] ANOMALY PERSON\`;
             
             if (!primaryResult) primaryResult = bioMatch;
          }
        });

        if (primaryResult) {
          setLiveRecognitionResult(primaryResult);
          if (primaryResult.isRecognized && primaryResult.matchedId) {
            missedFramesRef.current = 0;
            if (lastRecognizedIdRef.current !== primaryResult.matchedId) {
              if (lastRecognizedIdRef.current) {
                const exitedId = lastRecognizedIdRef.current;
                setBiometricLogs(prev => [{
                  id: Date.now().toString() + '-exit',
                  timestamp: new Date(),
                  type: 'EXIT',
                  memberId: exitedId,
                  memberName: biometricEngine.getMembers().find(m => m.id === exitedId)?.name || 'Unknown',
                  confidence: 0
                }, ...prev]);
              }
              lastRecognizedIdRef.current = primaryResult.matchedId;
              setBiometricLogs(prev => [{
                id: Date.now().toString() + '-enter',
                timestamp: new Date(),
                type: 'ENTER',
                memberId: primaryResult.matchedId!,
                memberName: primaryResult.matchedName!,
                confidence: primaryResult.confidencePercent
              }, ...prev]);
            }
          } else {
            if (lastRecognizedIdRef.current) {
              missedFramesRef.current++;
              if (missedFramesRef.current > 5) {
                const exitedId = lastRecognizedIdRef.current;
                setBiometricLogs(prev => [{
                  id: Date.now().toString() + '-exit',
                  timestamp: new Date(),
                  type: 'EXIT',
                  memberId: exitedId,
                  memberName: biometricEngine.getMembers().find(m => m.id === exitedId)?.name || 'Unknown',
                  confidence: 0
                }, ...prev]);
                lastRecognizedIdRef.current = null;
              }
            }
          }
        } else {
          setLiveRecognitionResult(null);
        }

        // Draw multiple objects
        renderTacticalSimulation(ctx, canvas.width, canvas.height, trackResult.targets, [], '1');
        
      }, 150);
    }

    return () => {
      clearInterval(scanInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLiveChamberActive, webcamStream]);
`;

// Replace the old useEffect
const oldUseEffectStart = "  // Live Camera Scan Loop\n  useEffect(() => {\n    let animationFrameId: number;";
const oldUseEffectEnd = "    return () => {\n      clearInterval(scanInterval);\n      cancelAnimationFrame(animationFrameId);\n    };\n  }, [isLiveChamberActive, webcamStream]);";

const startIndex = code.indexOf(oldUseEffectStart);
const endIndex = code.indexOf(oldUseEffectEnd) + oldUseEffectEnd.length;

if (startIndex > -1 && endIndex > -1) {
  code = code.substring(0, startIndex) + opticalLogic.trim() + code.substring(endIndex);
  fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
  console.log('Patched TeamBiometricsView.tsx');
} else {
  console.error('Could not find old useEffect');
}
