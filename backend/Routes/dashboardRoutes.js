// NOTE: This is a conceptual file for your backend server (e.js., Node.js/Express). 
// This file cannot be run in the browser.

import express from 'express';
// Import the controller from the peer Controllers folder
import { getFinanceDashboardData } from '../controllers/dashboardController.js'; 

const router = express.Router();

/**
 * GET /api/dashboard/finance
 * Delegates the request to the dashboard controller for calculation.
 * The logic is now in backend/Controllers/dashboardController.js
 */
router.get('/finance', getFinanceDashboardData);

export default router;

// --- How to use this route in your main Express app (e.g., server.js) ---
/*
// In your main Express application file (e.g., app.js or server.js):
import dashboardRoutes from './Routes/dashboard.js'; 
// Assuming the server file is one level above the 'backend' folder, 
// or adjust path if it's inside 'backend'.
// Example if server is in root: 
// import dashboardRoutes from './backend/Routes/dashboard.js'; 

// app.use('/api/dashboard', dashboardRoutes); 
*/
















// import express from 'express';
// import { getFinanceDashboardData } from '../controllers/dashboardController.js';

// const router = express.Router();

// // Define the endpoint: GET /api/dashboard/finance?month=10&year=2025
// router.get('/finance', getFinanceDashboardData);

// export default router;

// // --- Server Setup (Example in app.js/server.js) ---
// // import dashboardRoutes from './routes/dashboardRoutes.js';
// // app.use('/api/dashboard', dashboardRoutes);