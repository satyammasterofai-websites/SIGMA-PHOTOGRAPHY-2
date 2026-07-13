const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

if (!code.includes('import UserNotifications')) {
  code = code.replace(/import SupportChat from "\.\/user\/SupportChat";/, 'import SupportChat from "./user/SupportChat";\nimport UserNotifications from "../components/UserNotifications";');
}

// Add to Mobile Header
const mobileHeaderTarget = /<button\s*onClick=\{[^}]+\}\s*className="p-2 -mr-2 text-gray-600 rounded-md"\s*>\s*<Menu className="w-6 h-6" \/>\s*<\/button>/;
const mobileHeaderReplacement = `<div className="flex items-center gap-2">
            <UserNotifications />
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -mr-2 text-gray-600 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>`;

if (!code.includes('<UserNotifications />')) {
    code = code.replace(mobileHeaderTarget, mobileHeaderReplacement);
}

// Ensure there is a desktop header area or float the bell. Let's add a top bar to main content on desktop.
const desktopMainTarget = /<main className="flex-1 overflow-y-auto w-full">/;
const desktopMainReplacement = `<div className="hidden lg:flex justify-end p-4 border-b border-gray-200 bg-white/50 sticky top-0 z-10">
          <UserNotifications />
        </div>
        <main className="flex-1 overflow-y-auto w-full">`;

if (!code.includes('hidden lg:flex justify-end p-4 border-b')) {
    code = code.replace(desktopMainTarget, desktopMainReplacement);
}

fs.writeFileSync('src/pages/Dashboard.tsx', code);
