const fs = require('fs');
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf-8');

code = code.replace(
  '  let embedUrl = url;',
  '  let embedUrl = url;\n  let isVertical = false;'
);

code = code.replace(
  '  } else if (url.includes("instagram.com")) {',
  '  } else if (url.includes("youtube.com/shorts/")) {\n    const match = url.match(/youtube\\.com\\/shorts\\/([^/?]+)/);\n    if (match) {\n      embedUrl = `https://www.youtube.com/embed/${match[1]}`;\n      isVertical = true;\n    }\n  } else if (url.includes("instagram.com")) {'
);

code = code.replace(
  '    embedUrl = cleanUrl.endsWith("/")\n      ? `${cleanUrl}embed/`\n      : `${cleanUrl}/embed/`;',
  '    isVertical = true;\n    embedUrl = cleanUrl.endsWith("/")\n      ? `${cleanUrl}embed/`\n      : `${cleanUrl}/embed/`;'
);

code = code.replace(
  '      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">',
  '      <div \n        className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 mx-auto w-full flex justify-center`}\n        style={isVertical ? { height: "90vh", width: "min(100%, 50.625vh)", aspectRatio: "9/16" } : { maxWidth: "64rem", aspectRatio: "16/9" }}\n      >'
);

fs.writeFileSync('src/components/VideoModal.tsx', code);
console.log("Patched VideoModal");
