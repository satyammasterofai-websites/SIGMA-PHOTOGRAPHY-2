const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

code = code.replace("allow read: if isOwner(userId) || isAdmin();", "allow read: if isAuthenticated() && (isOwner(userId) || isAdmin() || resource.data.role == 'admin');");

fs.writeFileSync('firestore.rules', code);
