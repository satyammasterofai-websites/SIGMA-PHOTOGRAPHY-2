const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageTestimonials.tsx', 'utf-8');

code = code.replace(
  "setFormData(t); setShowModal(true);",
  "setFormData({ ...t, name: t.name || '', feedback: t.feedback || '', rating: t.rating || 5 }); setShowModal(true);"
);

fs.writeFileSync('src/pages/admin/ManageTestimonials.tsx', code);
console.log("Patched setFormData type error");
