const fs = require('fs');
let code = fs.readFileSync('src/components/CameraStream.tsx', 'utf-8');

code = code.replace(
  "const [filterPersonOnly, setFilterPersonOnly] = useState<boolean>(true);",
  "const [filterPersonOnly, setFilterPersonOnly] = useState<boolean>(false);"
);

fs.writeFileSync('src/components/CameraStream.tsx', code);
console.log("Patched CameraStream filter");
