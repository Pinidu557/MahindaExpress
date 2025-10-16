# MahindaExpress smart bus booking and management system

MahindaExpress is a comprehensive transportation management system designed to manage bus routes, bookings, staff, vehicles, maintenance, and financial operations. The application features a full-stack implementation with a React frontend and Node.js/Express backend.

## Features

### Customer Features
- **Route Management**: Browse and search available bus routes
- **Booking System**: Make online bus reservations with seat selection
- **Payment Integration**: Secure online payments through Stripe
- **User Accounts**: Register, login, and manage booking history
- **Contact System**: Submit inquiries and feedback
- **Chat Bot**: Get quick answers to common questions

### Administrative Features
- **Staff Management**: Track staff details, attendance, leave, and payroll
- **Vehicle Management**: Maintain fleet information, maintenance records, and fuel logs
- **Financial Management**: 
  - Budget planning and tracking
  - Expense management
  - Salary administration
  - Advance payments
  - Financial reporting
- **Maintenance Tracking**: Schedule and record vehicle maintenance
- **Parts Inventory**: Track vehicle parts and supplies
- **Reporting**: Generate various business reports

## Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM v7
- **UI**: Tailwind CSS
- **HTTP Client**: Axios
- **Data Visualization**: Chart.js, Recharts
- **PDF Generation**: jsPDF
- **Payment Processing**: Stripe.js
- **Toast Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Email**: Nodemailer
- **Payment Processing**: Stripe API
- **PDF Generation**: PDFKit
- **Date Management**: Moment.js

## Project Structure

### Backend
```
backend/
├── config/           # Database and service configurations
├── controllers/      # Request handlers
├── middleware/       # Authentication and error handlers
├── models/           # Database schemas
├── routes/           # API routes
├── scripts/          # Utility scripts
├── services/         # Business logic
├── uploads/          # Uploaded files
├── utils/            # Helper functions
└── server.js         # Entry point
```

### Frontend
```
frontend/
├── public/           # Static assets
├── src/
│   ├── api/          # API clients
│   ├── assets/       # Images, fonts, etc.
│   ├── components/   # Reusable components
│   ├── context/      # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Application pages
│   ├── App.jsx       # Main application component
│   └── main.jsx      # Entry point
└── index.html        # HTML template
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB
- Stripe account (for payment processing)

### Installation

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```


3. Start the backend server:
   ```bash
   npm run server
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

5. The application will be available at `http://localhost:5173`

### Creating Default Admin
For development purposes, you can create a default admin using:
```
POST http://localhost:4000/api/create-default-admin
```

## Deployment

### Backend Deployment
1. Ensure all environment variables are properly set for production
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment
1. Build the frontend application:
   ```bash
   cd frontend
   npm run build
   ```
2. The build artifacts will be in the `frontend/dist` directory, which can be served using any static file server

## License

This project is licensed under the ISC License.

## Contributors

- Pinidu
- Oshadha
- Nikeshala
- Kaveesha
- Hirun

---

© 2025 MahindaExpress. All rights reserved.
