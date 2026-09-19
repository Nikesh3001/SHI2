const fs = require('fs');
let code = fs.readFileSync('src/utils/faceRecognitionEngine.ts', 'utf-8');

const oldLogic = `        const logicalIndex = Math.abs(trackId - 101) % this.members.length;
        if (this.members.length > 0) {
            const member = this.members[logicalIndex];
        if (member) {`;

const newLogic = `        const logicalIndex = Math.abs(trackId - 101) % this.members.length;
        if (this.members.length > 0) {
            const member = this.members[logicalIndex];
            if (member) {`;

code = code.replace(oldLogic, newLogic);
code = code.replace(
`      // Completely unrecognized track -> Stranger / Anomaly highlighted in RED
      return {
        isRecognized: false,`,
`      } // Closes the if (this.members.length > 0)
      
      // Completely unrecognized track -> Stranger / Anomaly highlighted in RED
      return {
        isRecognized: false,`);

fs.writeFileSync('src/utils/faceRecognitionEngine.ts', code);
console.log("Fixed missing brace");
