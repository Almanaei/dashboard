const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  attachments: [{
    name: String,
    size: Number,
    type: String,
    url: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', reportSchema);
