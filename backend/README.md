# Recurvia Backend

This is the backend server for the Recurvia website, providing API endpoints for the contact form and newsletter subscription functionalities.

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Nodemailer (for sending emails)
- Express Validator (for input validation)

## Setup Instructions

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Set up environment variables**

Create or update the `.env` file in the `config` folder with your own values:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/recurvia
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=contact@recurvia.com
```

3. **Start the server**

For development (with nodemon for auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

## API Endpoints

### Contact Form

- **POST /api/contact**
  - Submit a new contact form message
  - Required fields: `name`, `email`, `subject`, `message`

- **GET /api/contact**
  - Get all contact form submissions (would normally be protected)

### Newsletter

- **POST /api/newsletter**
  - Subscribe to the newsletter
  - Required field: `email`

- **PUT /api/newsletter/unsubscribe**
  - Unsubscribe from the newsletter
  - Required field: `email`

- **GET /api/newsletter**
  - Get all newsletter subscribers (would normally be protected)

## Database Models

### Contact

- name (String, required)
- email (String, required)
- subject (String, required)
- message (String, required)
- createdAt (Date, default: now)

### Newsletter

- email (String, required, unique)
- subscribed (Boolean, default: true)
- subscribedAt (Date, default: now) 