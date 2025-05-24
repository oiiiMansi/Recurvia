const express = require('express');
const { check } = require('express-validator');
const { 
  subscribeNewsletter, 
  unsubscribeNewsletter, 
  getSubscribers 
} = require('../controllers/newsletterController');

const router = express.Router();

// Validation rules
const emailValidation = [
  check('email', 'Please include a valid email').isEmail()
];

router.post('/', emailValidation, subscribeNewsletter);
router.put('/unsubscribe', emailValidation, unsubscribeNewsletter);
router.get('/', getSubscribers);

module.exports = router; 