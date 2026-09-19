const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

// replace createOpticalMotionTracker with TemporalTrackingBuffer
code = code.replace(
  /import \{ createOpticalMotionTracker \} from '\.\.\/utils\/webcamVision';/,
  "import { TemporalTrackingBuffer } from '../utils/temporalTracker';\nimport { initAiVisionModel, detectObjects } from '../utils/aiVisionEngine';"
);

// find trackerRef declaration
code = code.replace(
  /const trackerRef = useRef<any>\(null\);/,
  "const trackerRef = useRef<any>(null);\n  const isProcessingRef = useRef(false);\n  useEffect(() => { initAiVisionModel(); }, []);"
);

// initialization
code = code.replace(
  /trackerRef\.current = createOpticalMotionTracker\(\);/,
  "trackerRef.current = new TemporalTrackingBuffer();"
);

// setInterval logic replacement
const oldInterval = `      scanInterval = setInterval(() => {
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

        trackResult.targets.forEach((target: any) => {`;

const newInterval = `      let lastScanTime = performance.now();
      scanInterval = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current || isProcessingRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.readyState < 2) return;

        isProcessingRef.current = true;
        
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) { isProcessingRef.current = false; return; }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Process frame for multiple objects using true YOLO AI
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastScanTime) / 1000);
        lastScanTime = now;
        
        const observations = await detectObjects(video);
        const trackResult = trackerRef.current.update(observations, dt, [], { personOnly: false, allowedClasses: [] });
        
        let primaryResult: any = null;

        trackResult.targets.forEach((target: any) => {`;

code = code.replace(oldInterval, newInterval);

// also need to free the lock at the end of the interval
const endInterval = `          setLiveRecognitionResult(primaryResult);
        }
      }, 150);`;

const newEndInterval = `          setLiveRecognitionResult(primaryResult);
        }
        isProcessingRef.current = false;
      }, 150);`;

code = code.replace(endInterval, newEndInterval);

// Also fix handleEnrollCurrentWebcamFaceToMember
const oldEnroll = `    const trackResult = trackerRef.current.processFrame(video, [], 22, undefined, { personOnly: false, allowedClasses: [] });`;
const newEnroll = `    // We just take the last known targets from the buffer
    const trackResult = { targets: trackerRef.current.getTracks ? trackerRef.current.getTracks() : [] };`;

code = code.replace(oldEnroll, newEnroll);

fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
console.log("Patched TeamBiometricsView AI!");
