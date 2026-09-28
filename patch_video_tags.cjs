const fs = require('fs');

function patchFile(file, regex, replacement) {
  let code = fs.readFileSync(file, 'utf-8');
  if (code.includes(regex) || typeof regex === 'object') {
    code = code.replace(regex, replacement);
    fs.writeFileSync(file, code);
    console.log(`patched ${file}`);
  }
}

patchFile('src/components/SplashVideo.tsx', 
  /<video\s+ref=\{videoRef\}\s+src=\{videoUrl\}/, 
  `{videoUrl ? <video ref={videoRef} src={videoUrl}`
);

// We need to also close the conditional rendering for SplashVideo if we did it like this, which is harder. 
