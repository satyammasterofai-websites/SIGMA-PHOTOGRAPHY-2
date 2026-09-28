const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

if (!code.includes('animate-fade-in-out')) {
  const css = `
@keyframes fade-in-out {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes slide-up {
  0% { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
  10% { opacity: 1; transform: translate(-50%, -50%); }
  90% { opacity: 1; transform: translate(-50%, -50%); }
  100% { opacity: 0; transform: translate(-50%, calc(-50% - 20px)); }
}

@keyframes scale-up {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
}

.animate-fade-in-out {
  animation: fade-in-out 1s ease-in-out;
}
.animate-slide-up {
  animation: slide-up 1s ease-in-out;
}
.animate-scale {
  animation: scale-up 1s ease-in-out;
}
`;
  code += css;
  fs.writeFileSync('src/index.css', code);
  console.log('patched index.css');
}
