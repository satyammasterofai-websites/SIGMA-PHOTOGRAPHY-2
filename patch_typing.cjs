const fs = require('fs');
let code = fs.readFileSync('src/hooks/useTypingIndicator.ts', 'utf-8');

code = code.replace(
  `        }
      }
    });

    return () => unsub();`,
  `        }
      }
    }, (err) => {
      console.error("Typing indicator error", err);
    });

    return () => unsub();`
);

fs.writeFileSync('src/hooks/useTypingIndicator.ts', code);
console.log("Patched useTypingIndicator.ts");
