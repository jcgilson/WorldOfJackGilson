const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  schedule: { type: Object, required: true }
}, { minimize: false, versionKey: false });

module.exports = mongoose.model('schedules', scheduleSchema);