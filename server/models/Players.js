import mongoose from 'mongoose'

const playersSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  tournamentId: { type: String, required: true },
  players: { type: Object, required: true }
}, { minimize: false, versionKey: false });

export default mongoose.model('players', playersSchema);