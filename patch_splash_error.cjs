const fs = require('fs');
let code = fs.readFileSync('src/components/SplashVideo.tsx', 'utf-8');

code = code.replace(
  /onError=\{\(e\) => console\.error\("Video player error:", e\)\}/,
  `onError={(e) => { console.error("Video player error:", e); closeSplash(); }}`
);

code = code.replace(
  /onError=\{\(e\) => console\.error\("Native video player error:", e\)\}/,
  `onError={(e) => { console.error("Native video player error:", e); closeSplash(); }}`
);

fs.writeFileSync('src/components/SplashVideo.tsx', code);
console.log('done');
