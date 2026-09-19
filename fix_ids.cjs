const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

appCode = appCode.replace(
  /id: \`rec-\$\{Date\.now\(\)\}\`/g,
  "id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`"
);

appCode = appCode.replace(
  /eventId: \`ARCHIVE-\$\{Date\.now\(\)\}\`/g,
  "eventId: `ARCHIVE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`"
);

appCode = appCode.replace(
  /id: \`alert-sim-\$\{Date\.now\(\)\}\`/g,
  "id: `alert-sim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`"
);

appCode = appCode.replace(
  /eventId: \`EVT-SIM-\$\{Date\.now\(\)\.toString\(36\)\.toUpperCase\(\)\}\`/g,
  "eventId: `EVT-SIM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`"
);

appCode = appCode.replace(
  /id: \`cam-pub-\$\{Date\.now\(\)\}\`/g,
  "id: `cam-pub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`"
);

fs.writeFileSync('src/App.tsx', appCode);

let anprCode = fs.readFileSync('src/components/AnprFrsView.tsx', 'utf-8');

anprCode = anprCode.replace(
  /id: \`veh-\$\{Date\.now\(\)\}\`/g,
  "id: `veh-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`"
);

anprCode = anprCode.replace(
  /id: \`sub-\$\{Date\.now\(\)\}\`/g,
  "id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`"
);

anprCode = anprCode.replace(
  /id: \`pub-\$\{Date\.now\(\)\}\`/g,
  "id: `pub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`"
);

fs.writeFileSync('src/components/AnprFrsView.tsx', anprCode);
