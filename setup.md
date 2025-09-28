# Quick Setup Guide

## Prerequisites
- Node.js (v16+)
- MongoDB
- Git

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file with:
# MONGO_URI=mongodb+srv://mahindaexpress:mahindaexpress123@cluster0.i06s51c.mongodb.net/MahindaExpress
# PORT=4000

npm run server
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:4000

npm run dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## Features Completed ✅
- Staff Management (CRUD)
- Attendance Tracking
- Payroll Management
- Reports & Analytics
- Modern UI with Tailwind CSS
- Responsive Design
- Real-time Statistics

## Next Steps
1. Start MongoDB service
2. Run backend server
3. Run frontend server
4. Open browser to http://localhost:5173
5. Start adding staff members!

## Troubleshooting
- Ensure MongoDB is running
- Check both servers are running on correct ports
- Verify .env files are created
- Check console for any errors
