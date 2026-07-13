const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

const oldAdmin = `    function isAdmin() {
      return request.auth != null && request.auth.token.email != null && (
        (request.auth.token.email.lower() == 'satyammasterofai@gmail.com') ||
        (request.auth.token.email.lower() == 'jhahimanshukumar87@gmail.com') ||
        (request.auth.token.email.lower() == 'sigmaphotography0001@gmail.com') ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }`;

const newAdmin = `    function isAdmin() {
      return request.auth != null && (
        (request.auth.token.email != null && request.auth.token.email.lower() == 'satyammasterofai@gmail.com') ||
        (request.auth.token.email != null && request.auth.token.email.lower() == 'jhahimanshukumar87@gmail.com') ||
        (request.auth.token.email != null && request.auth.token.email.lower() == 'sigmaphotography0001@gmail.com') ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }`;

code = code.replace(oldAdmin, newAdmin);

fs.writeFileSync('firestore.rules', code);
console.log("Patched firestore.rules");
