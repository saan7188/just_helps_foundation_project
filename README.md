# Just Helps

**Even ₹1 can make a big impact in someone’s life.**

Just Helps is a needs-first donation and campaign platform built with the MERN stack.

## What it demonstrates

- React + Vite frontend with React Router
- Node.js + Express REST API
- MongoDB + Mongoose
- JWT authentication and protected routes
- Password hashing with bcrypt
- Email OTP verification and password reset
- Campaign submission, review workflow and fundraiser dashboard
- Image uploads and protected campaign proof access
- Razorpay Test Mode integration (use test keys and test payment methods only)
- Responsive orange-and-black interface
- Rate limiting, Helmet security headers and environment-based secrets

## JWT authentication

The API verifies signed JSON Web Tokens using the server-side `JWT_SECRET`. Protected requests send the token in the `x-auth-token` header. Keep `JWT_SECRET` private and use a long, random value in deployment. Never place server secrets in the React/Vite frontend.

## Local setup

### Frontend
```bash
cd client
npm install
npm run dev
```

Optional frontend environment variable:
```env
VITE_API_URL=http://localhost:5000
```

### Backend
```bash
cd server
npm install
npm run dev
```

Configure the backend environment in `server/.env` or your hosting provider:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
EMAIL_FROM=your_verified_sender
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Never commit real credentials. Use Razorpay Test Mode credentials for testing; this does not mean live donations are enabled.

## Deployment

- Frontend: Vercel
- API: Render
- Database: MongoDB Atlas

Vite environment variables are embedded at build time, so redeploy the frontend after changing them. Backend secrets belong only in the backend host's environment settings.

## Demo limitations

This is a portfolio/demo project. Verify payment configuration and end-to-end behavior before describing the payment flow as production-ready or accepting real donations. Live charitable fundraising requires appropriate legal, financial, privacy and operational review.
