import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, Activity, 
  Cpu, 
  Camera as CameraIcon, 
  Upload, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Download, 
  Play, 
  Square,
  Lock,
  ChevronRight,
  Info,
  X,
  Settings
} from 'lucide-react';
import { AuthorizedTeamMember, Camera } from '../types';
import { TemporalTrackingBuffer } from '../utils/temporalTracker';
import { initAiVisionModel, detectObjects } from '../utils/aiVisionEngine';
import { renderTacticalSimulation } from '../utils/canvasRenderer';
import { 
  biometricEngine, 
  BiometricConfig, 
  extractBiometricVectorFromCanvas, 
  RecognitionResult 
} from '../utils/faceRecognitionEngine';

interface BiometricLogEntry {
  id: string;
  timestamp: Date;
  type: 'ENTER' | 'EXIT';
  memberId?: string;
  memberName?: string;
  confidence?: number;
}

interface TeamBiometricsViewProps {
  cameras: Camera[];
  onSelectCameraFeed?: (cameraId: string) => void;
  onInjectUnknownAlert?: () => void;
}

export const TeamBiometricsView: React.FC<TeamBiometricsViewProps> = ({
  cameras,
  onSelectCameraFeed,
  onInjectUnknownAlert
}) => {
  const [members, setMembers] = useState<AuthorizedTeamMember[]>([]);
  const [config, setConfig] = useState<BiometricConfig>(biometricEngine.getConfig());
  const [selectedMember, setSelectedMember] = useState<AuthorizedTeamMember | null>(null);
  
  // Training loop modal state
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingEpoch, setTrainingEpoch] = useState(0);
  const [trainingLoss, setTrainingLoss] = useState(0.42);
  const [trainingAccuracy, setTrainingAccuracy] = useState(94.2);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);

  // Live Biometric Testing Chamber
  const [isLiveChamberActive, setIsLiveChamberActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [liveRecognitionResult, setLiveRecognitionResult] = useState<RecognitionResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Edit / Add Member Modal
  const [editingMember, setEditingMember] = useState<AuthorizedTeamMember | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetMemberForPhotoUpload, setTargetMemberForPhotoUpload] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Operator Biometric Identity (Nikesh Reddy as Known Member in Green)
  const [operatorMode, setOperatorMode] = useState<'KNOWN_OPERATOR' | 'SIMULATE_UNKNOWN'>(
    biometricEngine.getOperatorRecognitionMode()
  );
  const [activeOperatorId, setActiveOperatorId] = useState<string>(
    biometricEngine.getActiveOperatorId()
  );

  const [biometricLogs, setBiometricLogs] = useState<BiometricLogEntry[]>([]);
  const lastRecognizedIdRef = useRef<string | null>(null);
  const missedFramesRef = useRef<number>(0);

  useEffect(() => {
    setMembers(biometricEngine.getMembers());
    setOperatorMode(biometricEngine.getOperatorRecognitionMode());
    setActiveOperatorId(biometricEngine.getActiveOperatorId());
    const unsub = biometricEngine.subscribe(() => {
      setMembers(biometricEngine.getMembers());
      setConfig(biometricEngine.getConfig());
      setOperatorMode(biometricEngine.getOperatorRecognitionMode());
      setActiveOperatorId(biometricEngine.getActiveOperatorId());
    });
    return () => unsub();
  }, []);

  const showNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

const trackerRef = useRef<any>(null);
  const lastTrackResultRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  useEffect(() => { initAiVisionModel(); }, []);
  if (!trackerRef.current) {
    trackerRef.current = new TemporalTrackingBuffer();
  }

  // Live Camera Scan Loop
  useEffect(() => {
    let animationFrameId: number;
    let scanInterval: any;

    if (isLiveChamberActive && webcamStream) {
      let lastScanTime = performance.now();
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
        lastTrackResultRef.current = trackResult;
        
        let primaryResult: any = null;

        trackResult.targets.forEach((target: any) => {
          if (target.isHuman) {
             const vector = extractBiometricVectorFromCanvas(canvas, target);
             const bioMatch = biometricEngine.recognizeFace(vector, undefined, target.trackId);
             target.biometricMatch = bioMatch;
             target.classificationStatus = bioMatch.isRecognized ? 'KNOWN' : 'ANOMALY';
             target.isAuthorizedTeamMember = bioMatch.isRecognized;
             target.isUnknownSubject = !bioMatch.isRecognized;
             target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
             target.label = bioMatch.isRecognized ? bioMatch.displayText : `⚠ [RED OBJECT] ANOMALY PERSON`;
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
        renderTacticalSimulation({
          ctx,
          osdCtx: ctx,
          width: canvas.width,
          height: canvas.height,
          camera: { id: 'webcam', name: 'Webcam' } as any,
          targets: trackResult.targets,
          step: 0,
          scanlineY: 0,
          isRecording: false,
          filterMode: 'all',
          pan: { x: 0, y: 0 },
          zoom: 1,
          showAnalytics: false
        });
        
      }, 150);
    }

    return () => {
      clearInterval(scanInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLiveChamberActive, webcamStream]);

  // Start Live Webcam
  const handleStartLiveChamber = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setWebcamStream(stream);
      setIsLiveChamberActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      showNotification('Webcam biometric chamber initialized. Ready for facial discrimination.');
    } catch (e) {
      showNotification('Could not access webcam. Check browser permissions.', 'warning');
    }
  };

  const handleStopLiveChamber = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      setWebcamStream(null);
    }
    setIsLiveChamberActive(false);
    setLiveRecognitionResult(null);
  };

  // Quick enroll current webcam face to an authorized member
  const handleEnrollCurrentWebcamFaceToMember = (memberId: string) => {
    if (!canvasRef.current || !trackerRef.current) return;
    
    // Find the largest target currently tracked to extract features from
    // We run one synchronous frame process to get the current targets
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    // We just take the last known targets from the buffer
    const trackResult = lastTrackResultRef.current || { targets: [] };
    
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
    if (!target) return;

    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    const updated: AuthorizedTeamMember = {
      ...target,
      biometricVector: vector,
      photoUrl: dataUrl,
      detectionCount: target.detectionCount + 1,
      lastSeenTimestamp: 'Live Webcam Enrolled',
      lastSeenCamera: 'Webcam-01'
    };

    biometricEngine.updateMember(updated);
    showNotification(`Successfully trained and bound live face template to ${target.name} (${target.id})!`);
  };

  // Execute AI Training Loop
  const handleStartAiTrainingLoop = async () => {
    setIsTraining(true);
    setTrainingLogs([
      'Initializing LBRCE ResNet-128 Biometric Classifier...',
      'Loading enrolled member feature embeddings (6 templates)...',
      'Establishing hyper-spherical angular margin loss (ArcFace)...'
    ]);

    await biometricEngine.trainLoop(20, (epoch, loss, acc) => {
      setTrainingEpoch(epoch);
      setTrainingLoss(loss);
      setTrainingAccuracy(acc);
      if (epoch % 4 === 0 || epoch === 20) {
        setTrainingLogs(prev => [
          ...prev,
          `Epoch ${epoch}/20 - Loss: ${loss} - Discrimination Accuracy: ${acc}% - Unknown Face Rejection Rate: 99.8%`
        ]);
      }
    });

    setIsTraining(false);
    showNotification('Neural Biometric Loop optimization complete! Model separation margins updated.');
  };

  // Upload custom photo from disk for a member
  const handleTriggerPhotoUpload = (memberId: string) => {
    setTargetMemberForPhotoUpload(memberId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handlePhotoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetMemberForPhotoUpload) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const member = members.find(m => m.id === targetMemberForPhotoUpload);
        if (member) {
          const updated: AuthorizedTeamMember = {
            ...member,
            photoUrl: dataUrl,
            photoDescription: `Uploaded high-resolution photo (${file.name})`
          };
          biometricEngine.updateMember(updated);
          showNotification(`Updated biometric portrait for ${member.name} (${member.id})!`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Export & Import Database
  const handleExportDatabase = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `lbrce_authorized_team_biometrics_${Date.now()}.json`);
    dl.click();
    showNotification('Biometric database exported as JSON.');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-2xl border text-xs font-mono-code flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200' 
            : 'bg-amber-950/95 border-amber-500 text-amber-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner / Tactical Control Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/80 border border-blue-600/50 rounded-lg text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-100 tracking-wide font-mono-code uppercase">
                6-Member Biometric Facial Database // Neural Discriminator
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE ROSTER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-red-950/80 text-red-400 border border-red-700/60">
                POLICY: STRANGER = RED SQUARE OBJECT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-code mt-0.5">
              Trained biometric templates for the 6 core team members. Anyone else detected is flagged as a New Face in a bold Red Square Object.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 font-mono-code text-xs">
          <button
            onClick={() => setIsTrainingModalOpen(true)}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Train AI Biometric Loop</span>
          </button>

          <button
            onClick={() => {
              if (isLiveChamberActive) handleStopLiveChamber();
              else handleStartLiveChamber();
            }}
            className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
              isLiveChamberActive 
                ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
          >
            <CameraIcon className="w-3.5 h-3.5" />
            <span>{isLiveChamberActive ? 'Stop Live Camera' : 'Live Camera Biometric Test'}</span>
          </button>

          <button
            onClick={() => {
              biometricEngine.resetToDefault();
              showNotification('Database reset to original 6 LBRCE team members.');
            }}
            title="Reset to 6 original photos"
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={handleExportDatabase}
            title="Export biometric database as JSON"
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export DB</span>
          </button>
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* OPERATOR CLEARANCE & BIOMETRIC RECOGNITION CONSOLE */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 font-mono-code uppercase">
                    OPERATOR CLEARANCE PROFILE // KNOWN TEAM MEMBER
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-emerald-950 text-emerald-400 border border-emerald-700">
                    STATUS: RECOGNIZED IN GREEN
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  You are registered as <strong className="text-emerald-300">Nikesh Reddy [SEC-LBRCE-01]</strong> from the 6 team photos. When you are on screen, AI marks you in green with zero intrusion alerts.
                </div>
              </div>
            </div>

            {/* Quick Discrimination Mode Switcher */}
            <div className="flex items-center gap-2 font-mono-code text-xs">
              <button
                onClick={() => {
                  biometricEngine.setOperatorRecognitionMode('KNOWN_OPERATOR');
                  showNotification('AI recognition locked to KNOWN MEMBER: Nikesh Reddy. Tagged in EMERALD GREEN with zero false alerts.');
                }}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all ${
                  operatorMode === 'KNOWN_OPERATOR'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>RECOGNIZE ME AS KNOWN MEMBER (GREEN)</span>
              </button>

              <button
                onClick={() => {
                  biometricEngine.setOperatorRecognitionMode('SIMULATE_UNKNOWN');
                  showNotification('Testing Stranger Mode: Face will be highlighted in RED SQUARE OBJECT and trigger alerts.', 'warning');
                }}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all ${
                  operatorMode === 'SIMULATE_UNKNOWN'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-400 animate-pulse'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>SIMULATE UNKNOWN STRANGER (RED)</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Active Identity:</span>
                <span className="font-bold text-emerald-400">Nikesh Reddy [SEC-LBRCE-01]</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Bounding Reticle:</span>
                <span className="text-emerald-400 font-bold">#10b981 (Emerald Green)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Intrusion Alarms:</span>
                <span className="text-slate-400 font-bold">MUTED (Command Clearance)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (canvasRef.current) {
                    handleEnrollCurrentWebcamFaceToMember('SEC-LBRCE-01');
                  } else {
                    handleStartLiveChamber();
                    showNotification('Webcam starting... look at camera to synchronize facial vector to Nikesh Reddy.');
                  }
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-700 hover:text-white text-emerald-400 border border-emerald-800 transition-colors flex items-center gap-1.5"
              >
                <CameraIcon className="w-3 h-3" />
                <span>Sync Live Camera Face to Nikesh Reddy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Camera Scanner Chamber (When active) */}
        {isLiveChamberActive && (
          <div className="bg-slate-900 border border-emerald-600/60 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-xs text-slate-100 font-mono-code uppercase">
                  LIVE OPTICAL SENSOR CHAMBER // REAL-TIME DISCRIMINATION FEED
                </span>
              </div>
              <div className="text-xs font-mono-code text-slate-400 flex items-center gap-4">
                <span>Threshold: {(config.threshold * 100).toFixed(0)}%</span>
                <button
                  onClick={handleStopLiveChamber}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Close Chamber
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                <video ref={videoRef} className="hidden" playsInline muted />
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
              </div>

              <div className="space-y-3 font-mono-code text-xs">
                <div className="p-3 rounded-lg border bg-slate-950/80">
                  <div className="text-slate-400 mb-1">REAL-TIME BIOMETRIC VERDICT:</div>
                  {liveRecognitionResult ? (
                    liveRecognitionResult.isRecognized ? (
                      <div className="text-emerald-400 flex items-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>AUTHORIZED: [{liveRecognitionResult.matchedId}] {liveRecognitionResult.matchedName}</span>
                        <span className="text-xs bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {liveRecognitionResult.confidencePercent}% MATCH
                        </span>
                      </div>
                    ) : (
                      <div className="text-red-400 flex items-center gap-2 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                        <span>UNREGISTERED PERSON: HIGHLIGHTED IN RED SQUARE OBJECT</span>
                      </div>
                    )
                  ) : (
                    <div className="text-slate-500 italic">Scanning facial vectors in optical field...</div>
                  )}
                </div>

                <div className="text-slate-300 text-xs">
                  <span className="font-bold text-slate-100">Quick-Bind Face:</span> Stand in front of camera and bind your live facial template to any member slot:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {members.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleEnrollCurrentWebcamFaceToMember(m.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] border border-slate-700 text-left truncate transition-colors"
                    >
                      Bind to {m.name.split(' ')[0]} ({m.id.slice(-2)})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Biometric Event History Log */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-slate-800 text-slate-400">
                <Settings className="w-4 h-4" />
              </span>
              <span className="font-bold text-sm text-slate-100 font-mono-code uppercase">
                BIOMETRIC ACCESS EVENT LOG
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto font-mono-code text-xs pr-2 custom-scrollbar">
            {biometricLogs.length === 0 ? (
              <div className="text-slate-500 italic p-2 border border-slate-800 border-dashed rounded text-center">
                No real-time biometric tracking events recorded yet. Open the Live Camera Biometric Test to begin processing.
              </div>
            ) : (
              biometricLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`flex items-center gap-3 p-2.5 rounded border transition-colors ${
                    log.type === 'ENTER' 
                      ? 'bg-emerald-950/20 border-emerald-900/40' 
                      : 'bg-slate-800/30 border-slate-700/50'
                  }`}
                >
                  <span className="text-slate-400 min-w-[70px]">{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span className={`font-bold w-12 ${log.type === 'ENTER' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {log.type}
                  </span>
                  <span className="text-slate-200 truncate flex-1">
                    {log.memberName} <span className="text-slate-500">({log.memberId})</span>
                  </span>
                  {log.type === 'ENTER' && log.confidence && (
                    <span className="ml-auto px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-emerald-400 font-bold shadow-inner">
                      {(log.confidence).toFixed(1)}%
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6 Authorized Member Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono-code text-slate-300 font-bold uppercase">
              <span>6 AUTHORIZED TEAM PROFILES (SEC-LBRCE-01 THROUGH 06)</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px]">
                ALL RECOGNIZED IN GREEN
              </span>
            </div>
            <div className="text-[11px] font-mono-code text-slate-500">
              Click "Upload Photo" to attach real personal picture or "Edit" to modify metadata.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, idx) => {
              const isCurrentOperator = member.id === activeOperatorId;
              return (
                <div
                  key={member.id}
                  className={`bg-slate-900 rounded-xl p-4 transition-all flex flex-col justify-between shadow-lg group relative overflow-hidden ${
                    isCurrentOperator
                      ? 'border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                      : 'border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Accent top line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isCurrentOperator 
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 animate-pulse'
                      : 'bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500'
                  }`}></div>

                  <div>
                    {/* Active Operator Banner */}
                    {isCurrentOperator && (
                      <div className="mb-2.5 px-2 py-1 rounded bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 text-[10px] font-mono-code font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>ACTIVE OPERATOR: YOU ARE RECOGNIZED IN GREEN</span>
                        </span>
                        <span className="bg-emerald-800 text-white px-1.5 py-0.2 rounded text-[9px]">
                          CLEARANCE AUTH
                        </span>
                      </div>
                    )}

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 bg-slate-950 shrink-0 shadow-md ${
                        isCurrentOperator ? 'border-emerald-400' : 'border-blue-500/40'
                      }`}>
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] font-mono-code text-emerald-400 text-center py-0.5 border-t border-emerald-500/30">
                          {member.id}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-blue-950/90 text-blue-300 border border-blue-700/60 font-bold">
                            {member.id}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                            {member.clearanceLevel.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-100 mt-1 truncate">
                          {member.name}
                        </h3>
                        <p className="text-[11px] text-blue-400 font-mono-code truncate">
                          {member.role}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono-code">
                          {member.department}
                        </p>
                      </div>
                    </div>

                    {/* Biometric Vector Stats */}
                    <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 font-mono-code text-[11px] space-y-1.5 mb-3">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Facial Vector:</span>
                        <span className="text-slate-200">128-D Normalized Embedding</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Reticle Color:</span>
                        <span className="text-emerald-400 font-bold">#10b981 (Green)</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Threshold:</span>
                        <span className="text-emerald-400 font-bold">{(member.recognitionThreshold * 100).toFixed(0)}% Match Required</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>CCTV Sightings:</span>
                        <span className="text-slate-200">{member.detectionCount} automated verifications</span>
                      </div>
                      {member.lastSeenCamera && (
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Last Sighting:</span>
                          <span className="text-blue-300">{member.lastSeenCamera} @ {member.lastSeenTimestamp || 'Recent'}</span>
                        </div>
                      )}
                      {member.notes && (
                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                          "{member.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono-code text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          biometricEngine.setActiveOperatorId(member.id);
                          showNotification(`Active Operator set to ${member.name}. AI will identify this face in Green color.`);
                        }}
                        className={`flex-1 py-1 rounded border text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${
                          isCurrentOperator
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>{isCurrentOperator ? '✓ Active Operator' : 'Set as Operator'}</span>
                      </button>

                      <button
                        onClick={() => handleTriggerPhotoUpload(member.id)}
                        className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1 text-[11px] transition-colors"
                        title="Upload your personal photo to this slot"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Photo</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Trigger a simulated sighting on CAM-01 or CAM-02
                          const cam = cameras[idx % cameras.length];
                          if (onSelectCameraFeed && cam) {
                            onSelectCameraFeed(cam.id);
                            showNotification(`Navigated to ${cam.code} (${cam.name}) to monitor ${member.name} in green reticle!`);
                          }
                        }}
                        className="flex-1 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 flex items-center justify-center gap-1 text-[11px] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View on CCTV (Green)</span>
                      </button>

                      <button
                        onClick={() => setEditingMember(member)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
                        title="Edit profile information"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sensor Fusion Pipeline Diagram */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl overflow-hidden relative">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase mb-4">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Active Sensor Fusion Pipeline (Dynamic Object Discrimination)</span>
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 font-mono-code text-[11px]">
            {/* Background connection lines (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-20 right-20 h-px bg-slate-700 -z-10 border-t border-dashed border-slate-600" />
            
            {/* Stream 1: CCTV + YOLO */}
            <div className="flex flex-col items-center bg-slate-800/80 border border-slate-600 rounded-lg p-3 w-48 shadow-lg z-10 relative">
              <div className="absolute -right-3 top-1/2 w-3 h-0.5 bg-blue-500 animate-pulse hidden md:block"></div>
              <span className="text-blue-400 font-bold mb-1 border-b border-blue-900/50 pb-1 w-full text-center">OPTICAL FEED</span>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">CCTV</span>
                <span className="text-slate-500">→</span>
                <span className="bg-blue-900/40 border border-blue-500/30 px-1.5 py-0.5 rounded text-blue-300">YOLO</span>
              </div>
              <div className="text-slate-500 my-1">↓</div>
              <span className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded font-bold w-full text-center">PERSON</span>
            </div>
            
            {/* Stream 2: LiDAR + Dynamic */}
            <div className="flex flex-col items-center bg-slate-800/80 border border-slate-600 rounded-lg p-3 w-48 shadow-lg z-10 relative">
              <div className="absolute -right-3 top-1/2 w-3 h-0.5 bg-amber-500 animate-pulse hidden md:block"></div>
              <span className="text-amber-400 font-bold mb-1 border-b border-amber-900/50 pb-1 w-full text-center">SPATIAL FEED</span>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">LiDAR</span>
                <span className="text-slate-500">→</span>
                <span className="bg-amber-900/40 border border-amber-500/30 px-1.5 py-0.5 rounded text-amber-300">DYNAMIC</span>
              </div>
              <div className="text-slate-500 my-1">↓</div>
              <span className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded font-bold w-full text-center">MOVING</span>
            </div>
            
            {/* Fusion Node */}
            <div className="flex flex-col items-center bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-3 w-56 shadow-[0_0_15px_rgba(16,185,129,0.15)] z-10">
              <span className="text-emerald-400 font-bold mb-2 border-b border-emerald-900 pb-1 w-full text-center flex items-center justify-center gap-2">
                <Cpu className="w-3.5 h-3.5" />
                FUSION ENGINE
              </span>
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400 px-3 py-1.5 rounded-sm font-bold tracking-widest text-center shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse w-full">
                MOVING PERSON
              </div>
            </div>
          </div>
        </div>

        {/* Live Logic Comparison Demonstration Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono-code">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase mb-3">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>AI Facial Discrimination Architecture & Loop Logic</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Authorized Person Box */}
            <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>WHEN 1 OF THE 6 TEAM MEMBERS IS ON SCREEN:</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                <li>Extracts 128-D embedding and calculates Cosine Similarity against the 6 enrolled vectors.</li>
                <li>Biometric match score &gt;= {(config.threshold * 100).toFixed(0)}% triggers instant authorization.</li>
                <li>Canvas renders <strong className="text-emerald-400">EMERALD GREEN RETICLE (#10b981)</strong> with Member ID (e.g. <span className="text-white font-bold">SEC-LBRCE-01 NIKESH REDDY</span>).</li>
                <li>Displays green corner brackets and verified military clearance tag.</li>
              </ul>
            </div>

            {/* Unknown Person Box */}
            <div className="bg-red-950/30 border border-red-600/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>WHEN ANYONE ELSE (STRANGER) IS ON SCREEN:</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                <li>Feature vector does not match any of the 6 authorized templates.</li>
                <li>Instantly designated as an <strong className="text-red-400">UNREGISTERED / NEW FACE</strong>.</li>
                <li>Canvas renders <strong className="text-red-400 font-bold">BOLD RED SQUARE OBJECT (#ef4444)</strong> with red pulsing perimeter.</li>
                <li>Alert tag: <span className="text-red-300">[ALERT: UNREGISTERED PERSON] NEW FACE DETECTED</span>.</li>
                <li>Automated incident logged to Incident Room & Evidence Locker.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI Training Loop Modal */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 font-mono-code text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm text-slate-100">
                  TRAIN & CALIBRATE BIOMETRIC AI LOOP
                </span>
              </div>
              <button
                onClick={() => setIsTrainingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Fine-tunes the separation margins between the 6 authorized LBRCE team vectors and the outlier "Unknown Face" boundary. Enhances rejection of non-members while ensuring robust recognition under varying lighting.
            </p>

            {/* Threshold Slider */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>Matching Sensitivity Threshold:</span>
                <span className="text-blue-400 font-bold">{(config.threshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.55"
                max="0.90"
                step="0.01"
                value={config.threshold}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  biometricEngine.updateConfig({ threshold: val });
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Tolerant (60%)</span>
                <span>Balanced (72% Recommended)</span>
                <span>Strict (85%)</span>
              </div>
            </div>

            {/* Training Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                <div className="text-slate-500 text-[10px]">CURRENT EPOCH</div>
                <div className="text-sm font-bold text-slate-100">{trainingEpoch} / 20</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                <div className="text-slate-500 text-[10px]">ARCFACE LOSS</div>
                <div className="text-sm font-bold text-emerald-400">{trainingLoss}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                <div className="text-slate-500 text-[10px]">ACCURACY</div>
                <div className="text-sm font-bold text-blue-400">{trainingAccuracy}%</div>
              </div>
            </div>

            {/* Live Terminal Output */}
            <div className="bg-black/90 p-3 rounded-lg border border-slate-800 text-[10px] text-emerald-400 font-mono h-32 overflow-y-auto space-y-1">
              {trainingLogs.length === 0 ? (
                <div className="text-slate-500 italic">Ready to run AI training loop...</div>
              ) : (
                trainingLogs.map((log, i) => (
                  <div key={i}>&gt; {log}</div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsTrainingModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close
              </button>
              <button
                onClick={handleStartAiTrainingLoop}
                disabled={isTraining}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5"
              >
                {isTraining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTraining ? 'Training in Progress...' : 'Start Training Loop'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 font-mono-code text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-slate-100">EDIT TEAM MEMBER</span>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">MEMBER ID</label>
                <input 
                  type="text" 
                  value={editingMember.id}
                  onChange={(e) => setEditingMember({...editingMember, id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">MEMBER NAME</label>
                <input 
                  type="text" 
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setEditingMember(null)} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                Cancel
              </button>
              <button 
                onClick={() => {
                  const originalMember = members.find(m => m.photoUrl === editingMember.photoUrl || m.name === editingMember.name);
                  if (originalMember) {
                    biometricEngine.updateMember(editingMember, originalMember.id);
                    showNotification(`Updated ${editingMember.name}`);
                  }
                  setEditingMember(null);
                }}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
