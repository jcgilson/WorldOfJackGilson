import mongoose from 'mongoose'

const dfsSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  tournamentId: { type: String, required: true },
  salaries: { type: Object, required: true }
}, { minimize: false, versionKey: false });

export default mongoose.model('dfs', dfsSchema);