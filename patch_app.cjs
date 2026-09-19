const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("const hasActiveAnomaly =")) {
  code = code.replace(
    "const unreadAlertCount = alerts.filter(a => a.status === 'NEW').length;",
    "const unreadAlertCount = alerts.filter(a => a.status === 'NEW').length;\n  const hasActiveAnomaly = alerts.some(a => a.status === 'NEW' && a.severity === 'CRITICAL');"
  );
  
  code = code.replace(
    '<div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">',
    '<div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${hasActiveAnomaly ? "bg-[#EA4335] text-white" : "bg-slate-950 text-slate-100"}`}>'
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx with background color");
}
