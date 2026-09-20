# Just Helps Foundation

A needs-first donation and campaign management platform built as a MERN-style portfolio application.

## Product flow

Just Helps separates the public donor experience from the fundraiser and admin workflows:

\`\`\`text
Visitor
  ├─ Explore verified needs
  ├─ Donate without creating an account
  └─ Read campaign verification information

Fundraiser
  ├─ Register with email verification
  ├─ Submit a campaign + supporting proof
  └─ Track review status from the dashboard

Admin
  ├─ Review submitted campaigns and proof
  ├─ Approve → publish
  ├─ Request more information / reject
  └─ Update or remove published campaigns
\`\`\`

A published campaign can be removed from public view without deleting its database record. This preserves the campaign history while making the public state reversible.

## What it demonstrates

- React + Vite frontend with React Router
- Node.js + Express REST API
- MongoDB + Mongoose
- JWT authentication and role-based admin routes
- Separate admin sign-in credentials
- Email OTP verification and password reset
- Campaign creation with image upload and admin verification
- Private proof-document access for authorized admins
- Responsive donor, fundraiser and admin experiences
- Rate limiting and Helmet security headers
- Centralized frontend API configuration
- GitHub Actions CI for frontend lint/build and server syntax checks
- A clearly labeled simulated payment and receipt flow

## Important: demo payments

This project does **not** process real payments.

The donation screen records simulated donations for portfolio demonstration. It does not collect or store real card numbers, CVV, UPI credentials, or banking credentials. Demo receipts explicitly state that they are not tax certificates.

Because there is no live payment gateway in this version, the project should not be described as having real Razorpay or payment-gateway processing.

## Project structure

\`\`\`text
just_helps_foundation_project/
├── client/                 # React + Vite frontend
├── server/                 # Express + MongoDB API
├── .github/workflows/      # CI checks
└── README.md
\`\`\`

## Local setup

### 1. Frontend

\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

Optional frontend environment variable:

\`\`\`env
VITE_API_URL=http://localhost:5000
\`\`\`

The deployed Vite frontend reads \`VITE_API_URL\) at build time, so changes to the Vercel environment variable require a new deployment. citeturn1search0turn1search1

### 2. Backend

\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

Backend environment variables:

\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173

EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
EMAIL_FROM=your_verified_sender

ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_bcrypt_hash
ADMIN_NAME=Just Helps Admin
\`\`\`

Email variables are required for email-based verification/reset and demo receipts.

## Security-focused implementation

The project includes:

- Password hashing with bcrypt
- Short-lived JWT verification tokens
- Password-reset tokens stored as SHA-256 hashes
- Expiring OTP/reset flows
- Rate limiting on authentication endpoints and the API
- Helmet security headers
- Restricted campaign upload types and size limits
- Random server-generated upload filenames
- Auth and admin middleware for protected operations
- Private storage and authenticated admin access for newly uploaded proof documents
- Public campaign API responses that omit proof documents and internal review notes
- Verified + approved campaign checks before campaign-specific demo donations
- Input validation for donation amounts and campaign IDs
- Campaign goal protection so a single donation cannot push the recorded total above the goal
- Environment variables for deployment-specific secrets and URLs
- A hashed admin credential configuration documented in \`.env.example\`

File-upload controls follow an allowlist, generated filenames and size limits; these are established defensive practices for upload features. citeturn0search12turn0search3

## Accessibility and responsive UX

The final UI pass includes:

- Visible keyboard focus indicators
- Semantic form labels
- Accessible button and tab states
- Modal dialog semantics
- Mobile layouts for the donor, fundraiser and admin flows
- Clear loading, empty and error states
- Reduced decorative imagery on the homepage in favor of hierarchy and whitespace

Visible focus indicators and properly associated form labels are core accessibility practices documented by W3C WAI. citeturn0search0turn0search8

## CI

GitHub Actions validates pushes to the main development branches and pull requests to \`main\`.

Checks include:

1. Client dependency installation
2. Client ESLint
3. Client production build
4. Server dependency installation
5. Server JavaScript syntax validation

## Deployment

The intended deployment split is:

- **Frontend:** Vercel
- **API:** Render
- **Database:** MongoDB Atlas

The frontend only receives the public API base URL through \`VITE_API_URL\). Server secrets such as the MongoDB connection string, JWT secret, SMTP credentials and admin credential hash belong on the server deployment.

Vercel environment variables are configured per deployment environment and require redeployment to affect a new frontend build. citeturn1search1

## Current limitations

This is a portfolio/demo application, not a production charitable-giving platform.

- Payments are simulated.
- Uploaded campaign images use server-side local storage.
- Newly uploaded proof documents are stored privately on the API server, but this storage is not durable object storage.
- Existing legacy proof files created before the private-storage change may require migration if they were previously stored in the public uploads directory.
- Email delivery depends on configured SMTP credentials.
- Production charitable giving would require durable object storage, stronger file-content/signature validation, a real payment provider, server-side webhook verification, operational monitoring, legal/compliance review and appropriate privacy controls before handling real money or sensitive documents.

## Portfolio / interview wording

Describe the project according to what is actually implemented:

> **Just Helps Foundation — MERN-style donation and campaign management platform**  
> Built a React/Vite + Node/Express + MongoDB platform with fundraiser registration, campaign submission and verification workflow, separate admin authentication, private proof-document access, reversible campaign publishing controls, responsive donation UX, simulated payment recording, JWT authentication, rate limiting and deployment-oriented configuration.

Do **not** describe the simulated donation flow as real payment processing or claim that the demo issues tax certificates.
