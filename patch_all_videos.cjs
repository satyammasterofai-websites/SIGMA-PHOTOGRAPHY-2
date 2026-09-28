const fs = require('fs');

function replaceVideoSrc(file) {
  let code = fs.readFileSync(file, 'utf-8');
  let original = code;
  code = code.replace(/<video([^>]*)src=\{([^}]+)\}/g, (match, p1, p2) => {
    // if it's already got || undefined, skip
    if (p2.includes('|| undefined')) return match;
    return `<video${p1}src={${p2} || undefined}`;
  });
  if (code !== original) {
    fs.writeFileSync(file, code);
    console.log(`Patched ${file}`);
  }
}

replaceVideoSrc('src/components/SplashVideo.tsx');
replaceVideoSrc('src/components/SelfVideoEditing.tsx');
replaceVideoSrc('src/pages/admin/ManageSelfVideoTemplates.tsx');
replaceVideoSrc('src/pages/admin/ManageSplashVideo.tsx');

