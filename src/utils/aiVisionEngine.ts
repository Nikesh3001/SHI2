import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectionObservation } from './temporalTracker';

let model: cocoSsd.ObjectDetection | null = null;
let isInitializing = false;

export async function initAiVisionModel() {
  if (model || isInitializing) return;
  isInitializing = true;
  try {
    await tf.ready();
    model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
    console.log("🔥 AI Vision Model (YOLO/COCO-SSD) Loaded successfully!");
  } catch (err) {
    console.error("Failed to load AI Vision Model:", err);
  } finally {
    isInitializing = false;
  }
}

export async function detectObjects(videoElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<DetectionObservation[]> {
  if (!model) return [];
  
  try {
    const predictions = await model.detect(videoElement);
    const observations: DetectionObservation[] = [];
    
    // Video dims
    let width = 640;
    let height = 480;
    
    if (videoElement instanceof HTMLVideoElement) {
       width = videoElement.videoWidth || 640;
       height = videoElement.videoHeight || 480;
    } else if (videoElement instanceof HTMLCanvasElement) {
       width = videoElement.width;
       height = videoElement.height;
    }
    
    for (const p of predictions) {
      if (p.score < 0.4) continue; // Minimum confidence
      
      const [x, y, w, h] = p.bbox;
      
      // Convert to percentages (0-100)
      const px = (x / width) * 100;
      const py = (y / height) * 100;
      const pw = (w / width) * 100;
      const ph = (h / height) * 100;
      
      
      let classification = 'object';
      if (p.class === 'person') classification = 'person';
      else if (['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(p.class)) classification = 'vehicle';
      else if (['bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'].includes(p.class)) classification = 'animal';
      
      observations.push({
        x: px,
        y: py,
        w: pw,
        h: ph,
        cx: px + pw / 2,
        cy: py + ph / 2,
        mass: (pw * ph) * 10,
        classification: classification as 'person' | 'vehicle' | 'animal' | 'object',
        cocoClass: p.class as any,
        cocoId: p.class === 'person' ? 1 : 99,
        isHuman: p.class === 'person',
        confidence: p.score,
        hasFace: p.class === 'person'
      });
    }
    
    return observations;
  } catch (e) {
    console.warn("AI detection skipped frame", e);
    return [];
  }
}
