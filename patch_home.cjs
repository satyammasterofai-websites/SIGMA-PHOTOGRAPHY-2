const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

if (!code.includes('SelfVideoEditing')) {
  code = code.replace(/import ContactAndTestimonials from '\.\.\/components\/ContactAndTestimonials';/, "import ContactAndTestimonials from '../components/ContactAndTestimonials';\nimport SelfVideoEditing from '../components/SelfVideoEditing';");
  
  code = code.replace(
    /<FadeInSection>\s*<ContactAndTestimonials \/>\s*<\/FadeInSection>/,
    `<FadeInSection>\n          <SelfVideoEditing />\n        </FadeInSection>\n        <FadeInSection>\n          <ContactAndTestimonials />\n        </FadeInSection>`
  );
  
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log('patched Home.tsx');
} else {
  console.log('already patched');
}
