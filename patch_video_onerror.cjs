const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', 'utf-8');

code = code.replace(
  /<video ref=\{videoRef\} src=\{editingTemplate\.videoUrl \|\| undefined\} controls className="w-full h-full object-contain pointer-events-auto" \/>/g,
  '<video ref={videoRef} src={editingTemplate.videoUrl || undefined} controls className="w-full h-full object-contain pointer-events-auto" onError={(e) => console.log("Video source not supported yet")} />'
);

code = code.replace(
  /<video src=\{editingTemplate\.videoUrl \|\| undefined\} controls className="w-full h-full object-contain" \/>/g,
  '<video src={editingTemplate.videoUrl || undefined} controls className="w-full h-full object-contain" onError={(e) => console.log("Video source not supported yet")} />'
);

fs.writeFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', code);
console.log('patched video onError');
