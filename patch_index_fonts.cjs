const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

if (!code.includes('fonts.googleapis.com/css2')) {
  code = code.replace(
    /<link rel="preconnect" href="https:\/\/fonts.gstatic.com" crossorigin>/,
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Dancing+Script:wght@400;600;700&family=Great+Vibes&family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:ital,wght@0,400;0,600;0,800;1,400;1,600&family=Oswald:wght@400;600;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">'
  );
  fs.writeFileSync('index.html', code);
  console.log('patched index.html fonts');
}
