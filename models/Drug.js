const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true, lowercase: true, trim: true },
  displayName: { type: String, required: true },
  category: String,
  description: String,
  commonBrands: [String],
  halfLife: String,
  metabolism: String
}, { timestamps: true });

drugSchema.index({ name: 'text', displayName: 'text' });
module.exports = mongoose.model('Drug', drugSchema);
