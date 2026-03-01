const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  drug1: { type: String, required: true, lowercase: true },
  drug2: { type: String, required: true, lowercase: true },
  severity: { 
    type: String, 
    enum: ['none', 'minor', 'moderate', 'major', 'contraindicated'],
    required: true 
  },
  description: { type: String, required: true },
  mechanism: String,
  clinicalEffects: [String],
  management: String,
  onsetTime: String,
  searchCount: { type: Number, default: 1 }
}, { timestamps: true });

interactionSchema.index({ drug1: 1, drug2: 1 }, { unique: true });
module.exports = mongoose.model('Interaction', interactionSchema);
