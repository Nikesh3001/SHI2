const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

code = code.replace("               if (!primaryResult) primaryResult = bioMatch;\n             }\n             \n             if (!primaryResult) primaryResult = bioMatch;", "             }\n");

fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
