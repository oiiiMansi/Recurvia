const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

// Check if we're using in-memory storage (set in server.js)
if (global.mockNewsletterModel) {
  module.exports = global.mockNewsletterModel;
} else {
  module.exports = mongoose.model('Newsletter', NewsletterSchema);
} 