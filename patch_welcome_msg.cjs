const fs = require('fs');
let code = fs.readFileSync('src/pages/user/SupportChat.tsx', 'utf-8');

const sendMsgReplacement = `  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      const isFirstMessage = messages.length === 0;
      await addDoc(collection(db, "chats"), {
        userId: user.uid,
        userEmail: user.email,
        sender: "user",
        text: newMessage,
        timestamp: serverTimestamp(),
        read: false
      });
      setNewMessage("");
      updateTyping(false);

      if (isFirstMessage) {
        setTimeout(async () => {
          try {
            await addDoc(collection(db, "chats"), {
              userId: user.uid,
              userEmail: user.email,
              sender: "admin",
              text: welcomeMessage,
              timestamp: serverTimestamp(),
              read: false
            });
          } catch (e) {
            console.error("Failed to send welcome message", e);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };`;

code = code.replace(/  const sendMessage = async \([\s\S]*?toast\.error\("Failed to send message"\);\n    }\n  };/, sendMsgReplacement);

// Remove the hardcoded welcome message
const uiRemovalRegex = /        <div className="flex justify-start">\s*<div className="max-w-\[70%\] rounded-2xl px-5 py-3 bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm">\s*<p className="whitespace-pre-wrap">\{welcomeMessage\}<\/p>\s*<\/div>\s*<\/div>/;
code = code.replace(uiRemovalRegex, "");

fs.writeFileSync('src/pages/user/SupportChat.tsx', code);
