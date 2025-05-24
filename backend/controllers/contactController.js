const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// @desc    Send contact form message and save to database
// @route   POST /api/contact
// @access  Public
exports.sendContactMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Save message to database
    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Admin email
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Only send email if email configuration exists
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      
      return res.status(200).json({
        success: true,
        data: contact,
        message: 'Contact form submitted successfully and email sent'
      });
    } else {
      // If email isn't configured, still return success but note email wasn't sent
      return res.status(200).json({
        success: true,
        data: contact,
        message: 'Contact form submitted successfully but email not sent (email not configured)'
      });
    }
  } catch (error) {
    console.error('Error in contact form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contact form submissions
// @route   GET /api/contact
// @access  Private (would normally be protected)
exports.getContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 