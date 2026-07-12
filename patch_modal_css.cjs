const fs = require('fs');
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf-8');

code = code.replace(
  '{ height: "90vh", width: "min(100%, 50.625vh)", aspectRatio: "9/16" }',
  '{ maxHeight: "90vh", width: "100%", maxWidth: "calc(90vh * 9 / 16)", aspectRatio: "9/16" }'
);

fs.writeFileSync('src/components/VideoModal.tsx', code);
console.log("Patched VideoModal CSS");
