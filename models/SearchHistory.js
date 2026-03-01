const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  drugs: [String],
  resultCount: Number,
  severityFound: String,
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
