// lib/firebaseAdmin.js
let admin, auth, db, storage;

if (typeof window === 'undefined') {
  admin = require('firebase-admin');
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  storage = admin.storage();
  db = admin.firestore();
  auth = admin.auth();
}

export { admin, auth, db, storage };
