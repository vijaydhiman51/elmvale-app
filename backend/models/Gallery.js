const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  photoId: String,
  description: String,
});

module.exports = mongoose.model('Gallery', imageSchema);