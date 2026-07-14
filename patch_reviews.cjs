const fs = require('fs');
let code = fs.readFileSync('src/pages/TemplateDetails.tsx', 'utf-8');

code = code.replace(
  `    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }`,
  ``
);

code = code.replace(
  `        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',`,
  `        userId: user ? user.uid : 'anonymous',
        userName: user ? (user.displayName || 'Anonymous') : 'Guest User',
        userPhoto: user ? (user.photoURL || '') : '',`
);

fs.writeFileSync('src/pages/TemplateDetails.tsx', code);
