const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', 'utf-8');

const oldInput = `<input type="text" value={tf.fontFamily} onChange={e => updateTextField(i, 'fontFamily', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" placeholder="Arial, sans-serif" />`;
const newSelect = `<select value={tf.fontFamily} onChange={e => updateTextField(i, 'fontFamily', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm">
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Great Vibes', cursive">Great Vibes</option>
                      <option value="'Cinzel', serif">Cinzel</option>
                      <option value="'Dancing Script', cursive">Dancing Script</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Lora', serif">Lora</option>
                      <option value="'Pacifico', cursive">Pacifico</option>
                      <option value="'Oswald', sans-serif">Oswald</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                    </select>`;

if (code.includes(oldInput)) {
  code = code.replace(oldInput, newSelect);
  fs.writeFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', code);
  console.log('patched font family dropdown');
} else {
  console.log('could not find font family input');
}
