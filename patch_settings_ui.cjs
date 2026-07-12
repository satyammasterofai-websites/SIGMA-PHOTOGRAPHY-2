const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSettings.tsx', 'utf-8');

const regex = /(<div className="pb-6 border-b border-gray-800">\s*<label className="block text-sm font-medium text-gray-300 mb-2">\s*Base Online Users[\s\S]*?className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3"\s*\/>\s*<\/div>)/;

const newBlock = `            $1

            <div className="pb-6 border-b border-gray-800">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-electric" />
                Live Chat Welcome Message
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                placeholder="Hello! How can we help you today?"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3"
              />
              <p className="text-xs text-gray-500 mt-2">
                This message will be shown to users when they open the live chat.
              </p>
            </div>`;

code = code.replace(regex, newBlock);

fs.writeFileSync('src/pages/admin/ManageSettings.tsx', code);
console.log("Patched settings UI");
