const fs = require('fs');
let code = fs.readFileSync('src/pages/user/SupportChat.tsx', 'utf-8');

const storeImport = `import { useSiteStore } from "../../store/useSiteStore";\nexport default function SupportChat() {`;
code = code.replace(/export default function SupportChat\(\) \{/, storeImport);

const stateHook = `  const { user } = useAuthStore();\n  const { settings } = useSiteStore();\n  const welcomeMessage = settings?.welcomeMessage || "Hello! How can we help you today?";`;
code = code.replace(/  const \{ user \} = useAuthStore\(\);/, stateHook);

const renderMessagesRegex = /(<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">\s*\{messages\.map\(\(msg\) => \()/;

const renderWelcomeMessage = `<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        <div className="flex justify-start">
          <div className="max-w-[70%] rounded-2xl px-5 py-3 bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm">
            <p className="whitespace-pre-wrap">{welcomeMessage}</p>
          </div>
        </div>
        {messages.map((msg) => (`;
code = code.replace(renderMessagesRegex, renderWelcomeMessage);

fs.writeFileSync('src/pages/user/SupportChat.tsx', code);
console.log("Patched support chat");
