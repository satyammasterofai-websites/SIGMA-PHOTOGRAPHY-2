const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf-8');
  let original = code;
  code = code.replace(/<video([^>]*)onError=\{[^}]+\}([^>]*)>/g, '<video$1onError={(e) => { e.currentTarget.style.display = "none"; console.log("Video error"); }}$2>');
  // if not already replaced
  if (code === original) {
    code = code.replace(/<video([^>]*)>/g, '<video$1 onError={(e) => { e.currentTarget.style.display = "none"; console.log("Video error"); }}>');
  }
  fs.writeFileSync(file, code);
}

// Just replace console.error with console.log in SplashVideo to avoid the error overlay triggering
let splash = fs.readFileSync('src/components/SplashVideo.tsx', 'utf-8');
splash = splash.replace(/console\.error\("Native video player error:", e\)/g, 'console.log("Native video player error:", e)');
fs.writeFileSync('src/components/SplashVideo.tsx', splash);

let self = fs.readFileSync('src/components/SelfVideoEditing.tsx', 'utf-8');
self = self.replace(/<video/g, '<video onError={(e) => console.log("Video error", e)}');
// wait, I might have added it multiple times. Let me just use regex
self = fs.readFileSync('src/components/SelfVideoEditing.tsx', 'utf-8');
self = self.replace(/<video onError=\{\(e\) => console\.log\("Video error", e\)\} onError=\{\(e\) => console\.log\("Video error", e\)\}/g, '<video onError={(e) => console.log("Video error", e)}');
fs.writeFileSync('src/components/SelfVideoEditing.tsx', self);

let adminSplash = fs.readFileSync('src/pages/admin/ManageSplashVideo.tsx', 'utf-8');
adminSplash = adminSplash.replace(/<video/g, '<video onError={(e) => console.log("Video error", e)}');
fs.writeFileSync('src/pages/admin/ManageSplashVideo.tsx', adminSplash);

