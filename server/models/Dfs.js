const mongoose = require('mongoose');

const dfsSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  tournamentId: { type: String, required: true },
  salaries: { type: Object, required: true }
}, { minimize: false, versionKey: false });

module.exports = mongoose.model('dfs', dfsSchema);