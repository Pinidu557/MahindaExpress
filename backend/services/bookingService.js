import Booking from "../models/bookings.js"; // Import the Booking model defined in bookings.js

/**
 * Calculates the total net income for a specific month and year.
 *
 * Income is counted if:
 * 1. The booking status is 'paid'.
 * 2. The revenue realization date (approvedAt for bank transfers, or
 * createdAt for card payments) falls within the target month/year.
 * 3. The booking has either not been cancelled, OR if cancelled,
 * the refund status is 'pending' or 'failed' (meaning the funds
 * have not been successfully returned to the customer).
 *
 * @param {number} targetMonth - The month to filter by (1 = Jan, 12 = Dec).
 * @param {number} targetYear - The year to filter by (e.g., 2024).
 * @returns {Promise<number>} The total calculated income (totalFare sum).
 */
async function getTotalIncome(targetMonth, targetYear) {
  // Define the date range for the target month
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 1);

  try {
    const incomeResult = await Booking.aggregate([
      // --- Step 1: Filter by Status and Refund Status ---
      {
        $match: {
          // 1. Must be a successfully paid booking
          status: "paid",

          // 2. The booking counts as income if:
          $or: [
            // a) Cancellation details do not exist (not cancelled)
            { cancellationDetails: { $exists: false } },
            // b) Cancellation occurred, but refund status is pending or failed
            {
              "cancellationDetails.refundStatus": {
                $in: ["pending", "failed"],
              },
            },
          ],
        },
      },

      // --- Step 2: Determine the correct revenue realization date ---
      // This is crucial because bank transfers use 'approvedAt' and card payments use 'createdAt'.
      {
        $addFields: {
          revenueDate: {
            $cond: {
              // If payment method is bank_transfer AND it was approved, use approvedAt
              if: {
                $and: [
                  { $eq: ["$paymentMethod", "bank_transfer"] },
                  { $ne: ["$bankTransferDetails.approvedAt", null] },
                ],
              },
              then: "$bankTransferDetails.approvedAt",
              // Otherwise (e.g., card payment or unapproved bank transfer with status 'paid' which shouldn't happen), use the creation date as a proxy for the payment date
              else: "$createdAt",
            },
          },
        },
      },

      // --- Step 3: Match the revenue realization date to the selected month/year ---
      {
        $match: {
          revenueDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },

      // --- Step 4: Group and calculate the total income ---
      {
        $group: {
          _id: null, // Group all matching documents
          totalIncome: { $sum: "$totalFare" },
        },
      },
    ]);

    // Return the total income or 0 if no results were found
    return incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;
  } catch (error) {
    console.error("Error calculating monthly income:", error);
    return 0;
  }
}

export { getTotalIncome };
