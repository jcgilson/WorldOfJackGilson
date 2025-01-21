const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  roundId: { type: Number, required: true },
  roundStatus: { type: String, required: true },
  year: { type: Number, required: true },
  tournamentId: { type: String, required: true },
  leaderboard: { type: Object, required: true },
  timestamp: { type: Number, required: true },
  status: { type: String, required: true },
  cutLines: { type: Object, required: true },
  lastAppliedSortMethod: { type: Number, required: true },
  displayDownIcon: { type: Boolean, required: true },
}, { minimize: false, versionKey: false });

module.exports = mongoose.model('leaderboards', leaderboardSchema);