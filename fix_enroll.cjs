const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

const oldLogic = `  const handleEnrollCurrentWebcamFaceToMember = (memberId: string) => {
    if (!canvasRef.current) return;
    const vector = extractBiometricVectorFromCanvas(canvasRef.current);
    const target = members.find(m => m.id === memberId);
    if (!target) return;`;

const newLogic = `  const handleEnrollCurrentWebcamFaceToMember = (memberId: string) => {
    if (!canvasRef.current || !trackerRef.current) return;
    
    // Find the largest target currently tracked to extract features from
    // We run one synchronous frame process to get the current targets
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const trackResult = trackerRef.current.processFrame(video, [], 22, undefined, { personOnly: false, allowedClasses: [] });
    
    let bestTarget = null;
    let maxArea = 0;
    trackResult.targets.forEach(t => {
      const area = t.w * t.h;
      if (area > maxArea) {
         maxArea = area;
         bestTarget = t;
      }
    });
    
    const vector = extractBiometricVectorFromCanvas(canvasRef.current, bestTarget || undefined);
    
    const target = members.find(m => m.id === memberId);
    if (!target) return;`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
console.log("Fixed enrollment vector extraction");
