const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: String,
  likedUserId: String,
});

module.exports = mongoose.model('Match', matchSchema);
