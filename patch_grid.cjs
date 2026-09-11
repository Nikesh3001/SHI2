const fs = require('fs');
let code = fs.readFileSync('src/components/CameraGrid.tsx', 'utf-8');

// Replace the click handler for the stream mode buttons
code = code.replace(
  "onClick={() => setGlobalStreamMode('webcam')}",
  "onClick={() => { setGlobalStreamMode('webcam'); onLayoutModeChange('1x1'); }}"
);

// Replace the camera div click handler
code = code.replace(
  "onClick={() => onSelectCamera(cam.id)}",
  "onClick={() => { onSelectCamera(cam.id); if (layoutMode !== '1x1') onLayoutModeChange('1x1'); }}"
);

// To truly ensure "make it blank" if someone forces grid mode while in webcam mode:
code = code.replace(
  "const displayedCameras = layoutMode === '1x1'",
  "const displayedCameras = (layoutMode === '1x1' || globalStreamMode === 'webcam')\n    ? [selectedCamera]\n    : layoutMode === '1x1'"
);

fs.writeFileSync('src/components/CameraGrid.tsx', code);
