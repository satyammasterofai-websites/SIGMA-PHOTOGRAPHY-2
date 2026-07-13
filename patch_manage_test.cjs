const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageTestimonials.tsx', 'utf-8');

// Update formData initialization
code = code.replace(
  "const [formData, setFormData] = useState({ id: '', imageUrl: '', isVisible: true, order: 0 });",
  "const [formData, setFormData] = useState({ id: '', imageUrl: '', name: '', feedback: '', rating: 5, isVisible: true, order: 0 });"
);

code = code.replace(
  "setFormData({ id: '', imageUrl: '', isVisible: true, order: testimonials.length });",
  "setFormData({ id: '', imageUrl: '', name: '', feedback: '', rating: 5, isVisible: true, order: testimonials.length });"
);

// Update save payload
const setDocMatch = `      await setDoc(doc(db, 'testimonials', id), {
        imageUrl: formData.imageUrl,
        isVisible: formData.isVisible,
        order: formData.order || testimonials.length
      });`;
const setDocReplace = `      await setDoc(doc(db, 'testimonials', id), {
        imageUrl: formData.imageUrl,
        name: formData.name || '',
        feedback: formData.feedback || '',
        rating: formData.rating || 5,
        isVisible: formData.isVisible,
        order: formData.order || testimonials.length
      });`;

code = code.replace(setDocMatch, setDocReplace);
// Note: Some formatting differences might prevent exact match, let's use regex if needed
code = code.replace(/await setDoc\(doc\(db, 'testimonials', id\), \{[\s\S]*?\}\);/, setDocReplace);

// Remove image requirement if text is provided
const imageReqMatch = `    if (!formData.imageUrl) {
       toast.error("Please upload a screenshot");
       return;
    }`;
const imageReqReplace = `    if (!formData.imageUrl && !formData.feedback) {
       toast.error("Please upload an image or provide text feedback");
       return;
    }`;
code = code.replace(imageReqMatch, imageReqReplace);


// Add text inputs to modal
const isVisibleMatch = `<div className="flex items-center gap-2 mb-6">`;
const textInputs = `             <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Client Name (Optional)</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" placeholder="e.g. Rahul & Priya" />
             </div>
             <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Feedback (Optional)</label>
                <textarea value={formData.feedback || ''} onChange={e => setFormData({...formData, feedback: e.target.value})} rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" placeholder="Write the review here..." />
             </div>
             <div className="mb-6">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={formData.rating || 5} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
             </div>
             `;
code = code.replace(isVisibleMatch, textInputs + isVisibleMatch);

// Update title inside modal
code = code.replace("{formData.id ? 'Edit' : 'Add'} Screenshot Testimonial", "{formData.id ? 'Edit' : 'Add'} Testimonial");

// Change empty state msg
code = code.replace("No screenshots uploaded yet.", "No testimonials added yet.");

// Change button
code = code.replace("Add Screenshot", "Add Testimonial");

// Remove image fallback from card rendering
const cardImgMatch = `               <img src={t.imageUrl || t.image} alt="Testimonial" className="w-full h-full object-contain" />`;
const cardImgReplace = `               {t.imageUrl || t.image ? (
                 <img src={t.imageUrl || t.image} alt="Testimonial" className="w-full h-full object-contain" />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                   <p className="text-white font-bold">{t.name || 'Anonymous'}</p>
                   <p className="text-gray-400 text-sm line-clamp-3 mt-2">{t.feedback}</p>
                 </div>
               )}`;
code = code.replace(cardImgMatch, cardImgReplace);

fs.writeFileSync('src/pages/admin/ManageTestimonials.tsx', code);
console.log("Patched ManageTestimonials");
