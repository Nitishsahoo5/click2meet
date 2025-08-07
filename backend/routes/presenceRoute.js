// ✅ FILE: routes/presenceRoute.js
const express = require('express');
const admin = require('../firebaseAdmin');
const router = express.Router();

router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { online } = req.body;

  try {
    const db = admin.database();
    await db.ref(`presence/${userId}`).set({
      online: online,
      lastSeen: admin.database.ServerValue.TIMESTAMP
    });
    res.status(200).json({ message: 'Presence updated' });
  } catch (error) {
    console.error('Error updating presence:', error);
    res.status(500).json({ error: 'Failed to update presence' });
  }
});

module.exports = router;
