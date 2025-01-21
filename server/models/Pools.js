const mongoose = require('mongoose');

const poolSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  tournamentId: { type: String, required: true },
  entryData: { type: Object, required: true }
}, { minimize: false, versionKey: false });

module.exports = mongoose.model('pools', poolSchema);