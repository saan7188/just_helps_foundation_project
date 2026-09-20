# Just Helps Foundation

A MERN-style donation and campaign management project built as a portfolio application.

## What it demonstrates

- React frontend with React Router
- Node.js + Express REST API
- MongoDB + Mongoose
- JWT authentication and role-based admin routes
- Email-based OTP verification and password reset
- Campaign creation with image upload and admin verification
- Protected user and admin routes
- Rate limiting and Helmet security headers
- Centralized frontend API configuration
- GitHub Actions CI for frontend lint/build and server syntax checks
- Responsive donation flow with a clearly labeled demo payment mode

## Important: demo payments

This project does **not** process real payments.

The donation screen records simulated donations for portfolio demonstration. It does not collect or store real card numbers, CVV, UPI credentials, or banking credentials. Demo receipts explicitly state that they are not tax certificates.

Because there is no live payment gateway in this version, the project should not be described as having real Razorpay/payment-gateway integration.

## Project structure

```text
just_helps_foundation_project/
├── client/                 # React + Vite frontend
├── server/                 # Express + MongoDB API
├── .github/workflows/      # CI checks
└── README.md
```

## Local setup

### 1. Frontend

```bash
cd client
npm install
npm run dev
```

Optional frontend environment variable:

```env
VITE_API_URL=http://localhost:5000
```

### 2. Backend

```bash
cd server
npm install
npm run dev
```

Backend environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173

EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
```

Email variables are only required for email-based verification/reset and demo receipts.

## Security-focused implementation

The project includes:

- Password hashing with bcrypt
- Short-lived JWT verification tokens
- Password-reset tokens stored as SHA-256 hashes
- Expiring OTP/reset flows
- Rate limiting on authentication endpoints and the API
- Helmet security headers
- Restricted campaign image MIME types and 5 MB upload limit
- Auth and admin middleware for protected operations
- Verified-campaign checks before donations
- Input validation for donation amounts and campaign IDs
- Campaign goal protection so a single donation cannot push the recorded total above the goal
- Environment variables for deployment-specific secrets and URLs

## CI

GitHub Actions validates the portfolio-hardening branch and pull requests to `main`.

Checks include:

1. Client dependency installation
2. Client ESLint
3. Client production build
4. Server dependency installation
5. Server JavaScript syntax validation

## Current limitations

This is a portfolio/demo application, not a production charitable-giving platform.

- Payments are simulated.
- Uploaded campaign images use server-side local storage.
- Email delivery depends on configured SMTP credentials.
- Production deployment should use durable object storage for user uploads and a real payment provider with server-side webhook verification before handling real money.

## Portfolio note

When describing this project on a resume or in an interview, focus on the technologies and engineering decisions that are actually present in the repository. Do not describe the demo payment flow as real payment processing.
