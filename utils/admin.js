const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_ADMIN_CONFIG) {
  
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);
} else {
  
  serviceAccount = require("./firebase-account.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
