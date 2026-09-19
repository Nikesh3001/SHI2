const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

const targetSection = `        {/* Live Logic Comparison Demonstration Bar */}`;
const newSection = `        {/* Sensor Fusion Pipeline Diagram */}
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

        {/* Live Logic Comparison Demonstration Bar */}`;

code = code.replace(targetSection, newSection);
fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
console.log("Patched TeamBiometricsView.tsx with Fusion Diagram");
