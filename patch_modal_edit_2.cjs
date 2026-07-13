const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageTestimonials.tsx', 'utf-8');

code = code.replace(
  "setFormData({ id: '', imageUrl: '', isVisible: true, order: 0 });",
  "setFormData({ id: '', imageUrl: '', name: '', feedback: '', rating: 5, isVisible: true, order: 0 });"
);

code = code.replace(
  "<button onClick={() => { setFormData(t); setShowModal(true); }}",
  "<button onClick={() => { setFormData({ ...t, name: t.name || '', feedback: t.feedback || '', rating: t.rating || 5, imageUrl: t.imageUrl || '', isVisible: t.isVisible ?? true, order: t.order || 0 }); setShowModal(true); }}"
);

fs.writeFileSync('src/pages/admin/ManageTestimonials.tsx', code);
console.log("Patched setFormData type error correctly");
