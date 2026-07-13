const fs = require('fs');
let code = fs.readFileSync('src/pages/user/SupportChat.tsx', 'utf-8');

code = code.replace(
  `      });
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsub();`,
  `      });
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, (err) => {
      console.error("SupportChat onSnapshot error:", err);
    });

    return () => unsub();`
);

fs.writeFileSync('src/pages/user/SupportChat.tsx', code);
console.log("Patched SupportChat.tsx");
