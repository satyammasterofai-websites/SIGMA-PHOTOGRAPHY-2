const fs = require('fs');

// Patch User Dashboard
let dashContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
if (!dashContent.includes('useChatNotifications')) {
  dashContent = dashContent.replace(
    "import SupportChat from \"./user/SupportChat\";",
    "import SupportChat from \"./user/SupportChat\";\nimport { useChatNotifications } from '../hooks/useChatNotifications';"
  );
  dashContent = dashContent.replace(
    "const location = useLocation();",
    "const location = useLocation();\n  const { unreadCount } = useChatNotifications();"
  );
  dashContent = dashContent.replace(
    "{item.name}\n                </Link>",
    "{item.name}\n                  {item.name === 'Support Chat' && unreadCount > 0 && (\n                    <span className=\"ml-auto bg-brand-rose text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full\">\n                      {unreadCount}\n                    </span>\n                  )}\n                </Link>"
  );
  fs.writeFileSync('src/pages/Dashboard.tsx', dashContent);
}

// Patch Admin Dashboard
let adminDashContent = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');
if (!adminDashContent.includes('useChatNotifications')) {
  adminDashContent = adminDashContent.replace(
    "import CleanupDuplicates from '../../components/CleanupDuplicates';",
    "import CleanupDuplicates from '../../components/CleanupDuplicates';\nimport { useChatNotifications } from '../../hooks/useChatNotifications';"
  );
  adminDashContent = adminDashContent.replace(
    "const location = useLocation();",
    "const location = useLocation();\n  const { unreadCount } = useChatNotifications();"
  );
  adminDashContent = adminDashContent.replace(
    "{item.name}\n                </Link>",
    "{item.name}\n                  {item.name === 'Customers' && unreadCount > 0 && (\n                    <span className=\"ml-auto bg-brand-rose text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full\">\n                      {unreadCount}\n                    </span>\n                  )}\n                </Link>"
  );
  fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', adminDashContent);
}
