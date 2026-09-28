const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

if (!code.includes('ManageSelfVideoTemplates')) {
  code = code.replace(/import ManageSplashVideo from '\.\/ManageSplashVideo';/, "import ManageSplashVideo from './ManageSplashVideo';\nimport ManageSelfVideoTemplates from './ManageSelfVideoTemplates';");
  
  code = code.replace(
    /\{ name: 'Site Content', path: '\/admin\/content', icon: Settings \},/,
    `{ name: 'Site Content', path: '/admin/content', icon: Settings },\n    { name: 'Video Editor', path: '/admin/video-editor', icon: FileEdit },`
  );
  
  code = code.replace(
    /<Route path="\/content" element=\{<SiteContentManagement \/>\} \/>/,
    `<Route path="/content" element={<SiteContentManagement />} />\n              <Route path="/video-editor" element={<ManageSelfVideoTemplates />} />`
  );
  
  fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
  console.log('patched admin dashboard');
} else {
  console.log('already patched');
}
