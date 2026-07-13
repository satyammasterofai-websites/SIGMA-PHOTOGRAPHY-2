const fs = require('fs');

const loginPath = 'src/pages/Login.tsx';
let loginCode = fs.readFileSync(loginPath, 'utf8');
loginCode = loginCode.replace(
  "toast.error('Password or Email Incorrect');",
  "toast.error(error.message || 'Password or Email Incorrect');"
);
fs.writeFileSync(loginPath, loginCode);

const signupPath = 'src/pages/Signup.tsx';
let signupCode = fs.readFileSync(signupPath, 'utf8');
signupCode = signupCode.replace(
  "toast.error('Failed to create account');",
  "toast.error(error.message || 'Failed to create account');"
);
fs.writeFileSync(signupPath, signupCode);
console.log("Patched auth errors");
