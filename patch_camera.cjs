const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

const targetString = `            target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
            target.label = bioMatch.isRecognized ? bioMatch.displayText : \`⚠ [RED OBJECT] ANOMALY PERSON\`;
          }
        });
      }`;

const newString = `            target.color = bioMatch.isRecognized ? '#10b981' : '#ef4444';
            target.label = bioMatch.isRecognized ? bioMatch.displayText : \`⚠ [RED OBJECT] ANOMALY PERSON\`;
          }
        });
      }
      
      // Autonomous Anomaly Incident Generation
      const detectedAnomaly = currentTargets.find(
        t => (t.classificationStatus === 'ANOMALY' || t.isUnknownSubject || t.color === '#ef4444' || t.label?.toLowerCase().includes('anomaly'))
      );

      if (detectedAnomaly) {
        const now = Date.now();
        if (now - lastBreachAlertThrottleRef.current > 4000) {
          lastBreachAlertThrottleRef.current = now;
          playTacticalAlertChime('warning');
          setActiveBreachAlert('AUTONOMOUS ANOMALY DETECTION');
          setTimeout(() => setActiveBreachAlert(null), 3500);
          if (onTripwireBreached) {
            onTripwireBreached(camera, { 
              id: 'anomaly-auto-' + Date.now(), 
              name: \`Autonomous Detection: \${detectedAnomaly.label || 'Unknown Subject'}\`, 
              type: 'restricted_zone', 
              points: [], 
              active: true 
            });
          }
        }
      }`;

code = code.replace(targetString, newString);
fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Patched CameraStream.tsx");
