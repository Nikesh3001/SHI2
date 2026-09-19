const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  '<div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${hasActiveAnomaly ? "bg-[#EA4335] text-white" : "bg-slate-950 text-slate-100"}`}>',
  '<div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Reverted App.tsx background color hack");
