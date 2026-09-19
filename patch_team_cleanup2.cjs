const fs = require('fs');
let code = fs.readFileSync('src/components/TeamBiometricsView.tsx', 'utf-8');

code = code.replace(
  "target.color = '#10b981';\n               target.label = bioMatch.displayText;\n             }",
  "target.color = '#10b981';\n               target.label = bioMatch.displayText;\n               if (!primaryResult) primaryResult = bioMatch;\n             }"
);

fs.writeFileSync('src/components/TeamBiometricsView.tsx', code);
