const fs = require('fs');
let code = fs.readFileSync('src/components/SelfVideoEditing.tsx', 'utf-8');

if (code.includes('video.play().then(() => {') && !code.includes('catch(')) {
  code = code.replace(
    /video\.play\(\)\.then\(\(\) => \{\s*drawFrame\(\);\s*\}\);/,
    `video.play().then(() => {
      drawFrame();
    }).catch(e => {
      console.error("Export video play error:", e);
      setIsExporting(false);
      alert("Failed to play video. Ensure the video source is valid and supported.");
    });`
  );
  fs.writeFileSync('src/components/SelfVideoEditing.tsx', code);
  console.log('patched video.play() in SelfVideoEditing.tsx');
}
