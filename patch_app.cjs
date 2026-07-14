const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import TemplateDetails")) {
  code = code.replace("import Checkout from './pages/Checkout';", "import Checkout from './pages/Checkout';\nimport TemplateDetails from './pages/TemplateDetails';");
  
  const routeTarget = `<Route path="/checkout/:id" element={<Checkout />} />`;
  const routeReplacement = `<Route path="/template/:id" element={<TemplateDetails />} />
        <Route path="/checkout/:id" element={<Checkout />} />`;
        
  code = code.replace(routeTarget, routeReplacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patched App.tsx');
}
