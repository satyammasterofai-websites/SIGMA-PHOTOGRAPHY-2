const fs = require('fs');

// Patch useChatNotifications
let hookContent = fs.readFileSync('src/hooks/useChatNotifications.ts', 'utf-8');
hookContent = hookContent.replace("const [unreadCount, setUnreadCount] = useState(0);", "const { setUnreadCount } = useChatStore();");
hookContent = hookContent.replace("const clearUnread = () => setUnreadCount(0);", "const { clearUnread } = useChatStore();");
hookContent = hookContent.replace("return { unreadCount, clearUnread };", "return null;");
hookContent = "import { useChatStore } from '../store/useChatStore';\n" + hookContent;
// Remove useState
hookContent = hookContent.replace("import { useEffect, useState, useRef } from 'react';", "import { useEffect, useRef } from 'react';");
fs.writeFileSync('src/hooks/useChatNotifications.ts', hookContent);

// Patch Dashboards
const filesToPatch = [
  'src/pages/Dashboard.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/components/SupportChatButton.tsx'
];

for (const file of filesToPatch) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace("import { useChatNotifications } from", "import { useChatStore } from");
  content = content.replace("const { unreadCount } = useChatNotifications();", "const { unreadCount } = useChatStore();");
  content = content.replace("const { unreadCount, clearUnread } = useChatNotifications();", "const { unreadCount, clearUnread } = useChatStore();");
  
  // also handle the path: useChatNotifications is in '../hooks/' but useChatStore is in '../store/'
  // Actually, wait, the path for useChatNotifications is '../hooks/useChatNotifications' or '../../hooks/useChatNotifications'
  // Let's replace 'hooks/useChatNotifications' with 'store/useChatStore'
  content = content.replace("hooks/useChatNotifications", "store/useChatStore");
  fs.writeFileSync(file, content);
}
