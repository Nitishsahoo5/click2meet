const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password });
  res.json({ _id: user._id, name: user.name, token: generateToken(user._id) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({ _id: user._id, name: user.name, token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;