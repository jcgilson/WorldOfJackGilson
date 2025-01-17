const mongoose = require('mongoose');

const playersSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  tournamentId: { type: String, required: true },
  players: { type: Object, required: true }
}, { minimize: false, versionKey: false });

module.exports = mongoose.model('players', playersSchema);