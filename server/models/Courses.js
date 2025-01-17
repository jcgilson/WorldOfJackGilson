const mongoose = require('mongoose');

const coursesSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  tournamentId: { type: String, required: true },
  courses: { type: Object, required: true }
}, { minimize: false, versionKey: false });

module.exports = mongoose.model('courses', coursesSchema);