const fs = require('fs');
let code = fs.readFileSync('src/pages/user/SupportChat.tsx', 'utf-8');

const importAdd = `import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs } from "firebase/firestore";`;
code = code.replace(/import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase\/firestore";/, importAdd);

const onlineStatusAdd = `  const [isSupportOnline, setIsSupportOnline] = useState(false);

  useEffect(() => {
    // Check if any admin is online
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const unsub = onSnapshot(q, (snapshot) => {
      let online = false;
      snapshot.forEach(d => {
        const admin = d.data();
        if (admin.isOnline && admin.lastSeen) {
          const lastSeenDate = typeof admin.lastSeen.toMillis === 'function' ? admin.lastSeen.toMillis() : new Date(admin.lastSeen).getTime();
          if (new Date().getTime() - lastSeenDate < 2 * 60 * 1000) {
            online = true;
          }
        }
      });
      setIsSupportOnline(online);
    });
    return () => unsub();
  }, []);`;

code = code.replace(/  const \{ isTyping, updateTyping \} = useTypingIndicator\(user\?\.uid \|\| ''\);/, `  const { isTyping, updateTyping } = useTypingIndicator(user?.uid || '');\n\n${onlineStatusAdd}`);

const uiAdd = `          <div>
            <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
              Customer Support
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {isSupportOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs text-gray-500">Online</span>
                </>
              ) : (
                <span className="text-xs text-gray-500">We typically reply in a few minutes</span>
              )}
            </div>
          </div>`;

code = code.replace(/          <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">\n            Customer Support\n          <\/h2>/, uiAdd);

fs.writeFileSync('src/pages/user/SupportChat.tsx', code);
