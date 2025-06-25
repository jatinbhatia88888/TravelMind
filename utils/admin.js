const admin = require("firebase-admin");
const serviceAccount = require("./firebase-account.json"); // you’ll get this from Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
