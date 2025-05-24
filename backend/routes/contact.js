const express = require('express');
const { check } = require('express-validator');
const { sendContactMessage, getContactMessages } = require('../controllers/contactController');

const router = express.Router();

// Validation rules
const contactValidation = [
  check('name', 'Name is required').not().isEmpty().trim(),
  check('email', 'Please include a valid email').isEmail(),
  check('subject', 'Subject is required').not().isEmpty().trim(),
  check('message', 'Message is required').not().isEmpty().trim()
];

router.post('/', contactValidation, sendContactMessage);
router.get('/', getContactMessages);

module.exports = router; 