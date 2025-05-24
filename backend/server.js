const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: './config/.env' });

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set static folder (for serving the frontend)
app.use(express.static(path.join(__dirname, '../')));

// Temporary in-memory storage if MongoDB is not available
if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('username:password')) {
  console.log('Using in-memory storage as fallback since MongoDB is not properly configured');
  
  // Simple in-memory store
  global.inMemoryDB = {
    contacts: [],
    newsletters: []
  };
  
  // Mock Contact model methods
  global.mockContactModel = {
    create: async (data) => {
      const contact = { 
        ...data, 
        _id: Date.now().toString(),
        createdAt: new Date()
      };
      global.inMemoryDB.contacts.push(contact);
      return contact;
    },
    find: async () => {
      return global.inMemoryDB.contacts;
    }
  };
  
  // Mock Newsletter model methods
  global.mockNewsletterModel = {
    create: async (data) => {
      const newsletter = { 
        ...data, 
        _id: Date.now().toString(),
        subscribed: true,
        subscribedAt: new Date()
      };
      global.inMemoryDB.newsletters.push(newsletter);
      return newsletter;
    },
    findOne: async ({ email }) => {
      return global.inMemoryDB.newsletters.find(sub => sub.email === email);
    },
    find: async ({ subscribed }) => {
      if (subscribed === true) {
        return global.inMemoryDB.newsletters.filter(sub => sub.subscribed === true);
      }
      return global.inMemoryDB.newsletters;
    }
  };
}

// Import routes
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Serve frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../', 'index.html'));
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// Connect to database if MONGO_URI is provided and valid, otherwise just start the server
if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('username:password')) {
  connectDB().then((connected) => {
    if (!connected) {
      console.log('Failed to connect to MongoDB, using in-memory storage as fallback');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  });
} else {
  console.log('MongoDB connection string not found or invalid, using in-memory storage');
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
} 