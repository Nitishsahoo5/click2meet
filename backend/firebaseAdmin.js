// ✅ FILE: firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./click2meet-57bb0-firebase-adminsdk-fbsvc-f8d61d3064.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://click2meet-57bb0-default-rtdb.firebaseio.com',
});

module.exports = admin;
