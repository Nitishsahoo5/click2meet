const express = require('express');
const Match = require('../models/Match');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/like', authMiddleware, async (req, res) => {
  const { likedUserId } = req.body;
  const match = await Match.create({ userId: req.user.id, likedUserId });
  res.json(match);
});

router.get('/my-likes', authMiddleware, async (req, res) => {
  const likes = await Match.find({ userId: req.user.id });
  res.json(likes);
});

module.exports = router;