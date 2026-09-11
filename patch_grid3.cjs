const fs = require('fs');
let code = fs.readFileSync('src/components/CameraGrid.tsx', 'utf-8');

code = code.replace(
  "onClick={() => onSelectCamera(cam.id)}",
  "onClick={() => { onSelectCamera(cam.id); if (layoutMode !== '1x1') onLayoutModeChange('1x1'); }}"
);

fs.writeFileSync('src/components/CameraGrid.tsx', code);
