const fs = require('fs');
let code = fs.readFileSync('src/components/SplashVideo.tsx', 'utf-8');

if (!code.includes('splashTimeoutRef')) {
  code = code.replace(
    /const videoRef = useRef<HTMLVideoElement>\(null\);/,
    `const videoRef = useRef<HTMLVideoElement>(null);\n  const splashTimeoutRef = useRef<any>(null);`
  );

  code = code.replace(
    /setShow\(true\);\n            setVisible\(true\);/,
    `setShow(true);\n            setVisible(true);\n            splashTimeoutRef.current = setTimeout(() => closeSplash(), 20000);`
  );
  
  code = code.replace(
    /setShow\(true\);\n          setVisible\(true\);/,
    `setShow(true);\n          setVisible(true);\n          splashTimeoutRef.current = setTimeout(() => closeSplash(), 20000);`
  );

  code = code.replace(
    /const closeSplash = \(\) => \{/,
    `const closeSplash = () => {\n    if (splashTimeoutRef.current) clearTimeout(splashTimeoutRef.current);`
  );
}

fs.writeFileSync('src/components/SplashVideo.tsx', code);
console.log('done');
