const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

// 1. Add temporal buffer import if missing (it's already there)
// 2. Add an instance of TemporalTrackingBuffer in the component
if (!code.includes('const liveTrackerRef = useRef<TemporalTrackingBuffer | null>(null);')) {
  code = code.replace(
    /const workerRef = useRef<Worker \| null>\(null\);/,
    "const workerRef = useRef<Worker | null>(null);\n  const liveTrackerRef = useRef<any>(null);"
  );
  
  // replace imports if TemporalTrackingBuffer is missing
  if (!code.includes('TemporalTrackingBuffer')) {
    code = code.replace(
      /import \{ updateSimulationStep \} from '\.\.\/utils\/temporalTracker';/,
      "import { updateSimulationStep, TemporalTrackingBuffer } from '../utils/temporalTracker';"
    );
  }

  // Inside useEffect where it initializes worker, also init liveTrackerRef
  code = code.replace(
    /workerRef\.current = new VisionWorker\(\);/,
    "workerRef.current = new VisionWorker();\n    liveTrackerRef.current = new TemporalTrackingBuffer();\n    initAiVisionModel();" // Start loading TFJS ASAP
  );

  // In the render loop for webcam
  const oldWebcamBlock = `      // Computer Vision motion evaluation on live video/webcam
      if ((streamMode === 'webcam' || streamMode === 'video') && videoRef.current && videoRef.current.readyState >= 2) {
        
        // Post frame to worker if ready
        if (!isWorkerBusy.current && workerRef.current) {`;

  const newWebcamBlock = `      // Computer Vision motion evaluation on live video/webcam
      if ((streamMode === 'webcam' || streamMode === 'video') && videoRef.current && videoRef.current.readyState >= 2) {
        
        if (streamMode === 'webcam') {
           // Direct Main-Thread TFJS YOLO Object Detection for dynamic, accurate live tracking
           if (!isWorkerBusy.current) {
             isWorkerBusy.current = true;
             detectObjects(videoRef.current).then(observations => {
                isWorkerBusy.current = false;
                if (liveTrackerRef.current) {
                   const result = liveTrackerRef.current.update(observations, deltaTime, camera.virtualFences, {
                      personOnly: filterPersonOnly,
                      allowedClasses: filterPersonOnly ? ['person'] : []
                   });
                   currentTargets = result.targets;
                   targetsRef.current = result.targets;
                   if (result.filteredNonHumanCount !== undefined) {
                     setFilteredTelemetry({
                       nonHumanCount: result.filteredNonHumanCount,
                       classes: result.filteredClasses,
                       totalTracked: result.totalTrackedCount
                     });
                   }
                }
             });
           }
        }
        else if (!isWorkerBusy.current && workerRef.current) {`;
        
  code = code.replace(oldWebcamBlock, newWebcamBlock);
  fs.writeFileSync('src/components/CameraStream.tsx', code);
  console.log("Patched CameraStream to use dynamic TFJS detection!");
}
