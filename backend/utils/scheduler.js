import { autoCancelPendingBookings } from "../controllers/bookingController.js";

// Auto-cancel pending bookings scheduler
const startAutoCancellationScheduler = () => {
  console.log("Starting auto-cancellation scheduler...");
  
  // Run immediately on startup
  autoCancelPendingBookings();
  
  // Then run every 15 minutes
  setInterval(async () => {
    console.log("Running auto-cancellation check...");
    const result = await autoCancelPendingBookings();
    
    if (result.success && result.cancelledCount > 0) {
      console.log(`Auto-cancelled ${result.cancelledCount} expired pending bookings`);
    }
  }, 15 * 60 * 1000); // 15 minutes in milliseconds
};

export { startAutoCancellationScheduler };
