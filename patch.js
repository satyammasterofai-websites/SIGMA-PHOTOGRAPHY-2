const fs = require('fs');
const content = fs.readFileSync('src/pages/user/SupportChat.tsx', 'utf-8');
const search = `              <p>{msg.text}</p>
              <div className={\`flex items-center justify-end gap-1 text-[10px] mt-1 \${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}\`}>
                {(msg.timestamp && typeof msg.timestamp.toDate === 'function') 
                   ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                   : (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...')}
              </p>
            </div>`;
const replace = `              <p>{msg.text}</p>
              <div className={\`flex items-center justify-end gap-1 text-[10px] mt-1 \${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}\`}>
                <span>
                  {(msg.timestamp && typeof msg.timestamp.toDate === 'function') 
                     ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                     : (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...')}
                </span>
                {msg.sender === 'user' && (
                  msg.read ? <CheckCheck className="w-3 h-3 text-blue-300" /> : <Check className="w-3 h-3 opacity-70" />
                )}
              </div>
            </div>`;
fs.writeFileSync('src/pages/user/SupportChat.tsx', content.replace(search, replace));
