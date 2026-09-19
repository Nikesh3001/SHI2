const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

const targetSection = `{/* OSD Layout */}`;
const newSection = `{/* OSD Layout */}
      {/* Sensor Fusion Pipeline Diagram overlay */}
      {streamMode === 'webcam' && (
        <div className="absolute top-4 left-4 z-40 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-2xl scale-90 origin-top-left font-mono-code flex flex-col gap-2 max-w-[280px]">
          <div className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1.5 border-b border-slate-700/50 pb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sensor Fusion Active
          </div>
          <div className="flex flex-col gap-1.5 text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400 font-bold bg-blue-900/30 px-1 rounded">CCTV</span>
              <span className="text-slate-500 text-[8px]">▶</span>
              <span className="text-blue-300 bg-blue-900/30 px-1 rounded border border-blue-500/20">YOLO</span>
              <span className="text-slate-500 text-[8px]">▶</span>
              <span className="text-emerald-400 font-bold">PERSON</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold bg-amber-900/30 px-1 rounded">LiDAR</span>
              <span className="text-slate-500 text-[8px]">▶</span>
              <span className="text-amber-300 bg-amber-900/30 px-1 rounded border border-amber-500/20">DYNAMIC</span>
              <span className="text-slate-500 text-[8px]">▶</span>
              <span className="text-emerald-400 font-bold">MOVING</span>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-700/50 flex items-center justify-between">
              <span className="text-slate-400">OUTPUT:</span>
              <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.2)]">MOVING PERSON</span>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(targetSection, newSection);
fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Patched CameraStream.tsx with Fusion Diagram");
