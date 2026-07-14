const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/CustomerDetail.tsx', 'utf-8');

const importAdd = `import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, doc } from "firebase/firestore";`;
code = code.replace(/import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase\/firestore";/, importAdd);

const onlineStatusAdd = `  const [isCustomerOnline, setIsCustomerOnline] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isOnline && data.lastSeen) {
          const lastSeenDate = typeof data.lastSeen.toMillis === 'function' ? data.lastSeen.toMillis() : new Date(data.lastSeen).getTime();
          setIsCustomerOnline(new Date().getTime() - lastSeenDate < 2 * 60 * 1000);
        } else {
          setIsCustomerOnline(false);
        }
      }
    });
    return () => unsub();
  }, [user?.id]);`;

code = code.replace(/  const \{ isTyping, updateTyping \} = useTypingIndicator\(user\?\.id \|\| ''\);/, `  const { isTyping, updateTyping } = useTypingIndicator(user?.id || '');\n\n${onlineStatusAdd}`);

const uiAdd = `        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{user.name || "Customer"}</h2>
            {isCustomerOnline && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Online"></span>}
          </div>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>`;

code = code.replace(/        <div>\n          <h2 className="text-lg font-bold text-white">\{user\.name \|\| "Customer"\}<\/h2>\n          <p className="text-sm text-gray-400">\{user\.email\}<\/p>\n        <\/div>/, uiAdd);

fs.writeFileSync('src/pages/admin/CustomerDetail.tsx', code);
