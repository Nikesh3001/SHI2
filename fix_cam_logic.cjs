const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

const targetLogicToFix = `        const cvResult = latestCvResultRef.current;
        if (cvResult) {
          if (streamMode === 'webcam') {
            currentTargets = cvResult.targets;
            targetsRef.current = cvResult.targets;
            if (cvResult.filteredNonHumanCount !== undefined) {
              setFilteredTelemetry({
                nonHumanCount: cvResult.filteredNonHumanCount,
                classes: cvResult.filteredClasses,
                totalTracked: cvResult.totalTrackedCount
              });
            }
          } else {
            targetsRef.current = updateSimulationStep(targetsRef.current, deltaTime, camera.virtualFences);
            currentTargets = targetsRef.current;
          }
        } else {
          // Fallback while waiting for first worker result
          if (streamMode === 'video') {
            targetsRef.current = updateSimulationStep(targetsRef.current, deltaTime, camera.virtualFences);
            currentTargets = targetsRef.current;
          }
        }`;

const newLogic = `        if (streamMode === 'webcam') {
            // Already handled by the direct TFJS YOLO engine loop above
            currentTargets = targetsRef.current;
        } else {
            const cvResult = latestCvResultRef.current;
            if (cvResult) {
              targetsRef.current = updateSimulationStep(targetsRef.current, deltaTime, camera.virtualFences);
              currentTargets = targetsRef.current;
            } else {
              if (streamMode === 'video') {
                targetsRef.current = updateSimulationStep(targetsRef.current, deltaTime, camera.virtualFences);
                currentTargets = targetsRef.current;
              }
            }
        }`;

code = code.replace(targetLogicToFix, newLogic);
fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Fixed camera target sync logic");
