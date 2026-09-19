const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');
code = code.replace("UserX,", "UserX, Activity,");
fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
