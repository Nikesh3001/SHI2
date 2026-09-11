import { createOpticalMotionTracker } from '../utils/webcamVision';

let tracker: ReturnType<typeof createOpticalMotionTracker> | null = null;

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    tracker = createOpticalMotionTracker();
    self.postMessage({ type: 'INIT_DONE' });
  } else if (type === 'PROCESS_FRAME') {
    if (!tracker) return;
    
    const { imageBitmap, virtualFences, sensitivity, explicitDeltaTime, filterConfig } = payload;
    
    try {
      const result = tracker.processFrame(
        imageBitmap,
        virtualFences,
        sensitivity,
        explicitDeltaTime,
        filterConfig
      );
      
      self.postMessage({ type: 'RESULT', payload: result });
    } catch (err) {
      console.error('Worker processing error:', err);
    } finally {
      // Free memory for transferred ImageBitmap
      if (imageBitmap && typeof imageBitmap.close === 'function') {
        imageBitmap.close();
      }
    }
  }
};
