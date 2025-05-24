const Newsletter = require('../models/Newsletter');
const { validationResult } = require('express-validator');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
exports.subscribeNewsletter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email } = req.body;
    
    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email });
    
    if (subscriber) {
      // If subscriber exists but unsubscribed previously
      if (!subscriber.subscribed) {
        subscriber.subscribed = true;
        subscriber.subscribedAt = Date.now();
        
        // In-memory model doesn't have save method
        if (global.mockNewsletterModel) {
          const index = global.inMemoryDB.newsletters.findIndex(s => s.email === email);
          if (index !== -1) {
            global.inMemoryDB.newsletters[index].subscribed = true;
            global.inMemoryDB.newsletters[index].subscribedAt = new Date();
          }
        } else {
          await subscriber.save();
        }
        
        return res.status(200).json({
          success: true,
          data: subscriber,
          message: 'You have been re-subscribed to our newsletter'
        });
      }
      
      // Already subscribed
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed to our newsletter'
      });
    }
    
    // Create new subscription
    subscriber = await Newsletter.create({
      email
    });
    
    res.status(201).json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   PUT /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribeNewsletter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email } = req.body;
    
    // Find the subscriber
    const subscriber = await Newsletter.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter subscription list'
      });
    }
    
    // Update subscription status
    subscriber.subscribed = false;
    
    // In-memory model doesn't have save method
    if (global.mockNewsletterModel) {
      const index = global.inMemoryDB.newsletters.findIndex(s => s.email === email);
      if (index !== -1) {
        global.inMemoryDB.newsletters[index].subscribed = false;
      }
    } else {
      await subscriber.save();
    }
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Error in newsletter unsubscription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter
// @access  Private (would normally be protected)
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ subscribed: true }).sort({ subscribedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 