const fs = require('fs');
let code = fs.readFileSync('src/components/CameraGrid.tsx', 'utf-8');

code = code.replace(
  "const gridClass = layoutMode === '1x1'",
  "const gridClass = (layoutMode === '1x1' || globalStreamMode === 'webcam')\n    ? 'grid-cols-1'\n    : layoutMode === '1x1'"
);

fs.writeFileSync('src/components/CameraGrid.tsx', code);
