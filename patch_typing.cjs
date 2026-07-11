const fs = require('fs');
let content = fs.readFileSync('src/hooks/useTypingIndicator.ts', 'utf-8');

const search = `    } catch (e) {\n      console.error('Error updating typing status', e);\n    }`;

const replace = `    } catch (e: any) {\n      // Silently ignore permission errors for typing indicator to avoid console spam if rules aren't deployed yet\n      if (e.code !== 'permission-denied') {\n        console.error('Error updating typing status', e);\n      }\n    }`;

content = content.replace(search, replace);
fs.writeFileSync('src/hooks/useTypingIndicator.ts', content);
