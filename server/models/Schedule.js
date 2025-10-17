import mongoose from 'mongoose'

const scheduleSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  schedule: { type: Object, required: true }
}, { minimize: false, versionKey: false });

export default mongoose.model('schedules', scheduleSchema);