const admin = require("firebase-admin");

admin.initializeApp({
  projectId: "react-example" // This might fail, but let's see. Wait, I can't use admin SDK locally without credentials easily unless I use the client SDK.
});
