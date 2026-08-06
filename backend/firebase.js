const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./serviceAccountKey.json');

const adminApp = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(adminApp);
const auth = getAuth(adminApp);

module.exports = { db, FieldValue, auth };
