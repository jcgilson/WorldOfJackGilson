const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  tournamentId: { type: String, required: true },
  leaderboard: { type: Object, required: true }
}, { minimize: false, versionKey: false });

module.exports = mongoose.model('leaderboards', leaderboardSchema);