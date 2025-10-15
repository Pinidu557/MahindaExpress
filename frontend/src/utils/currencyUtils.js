// Example implementation of formatLKR
export const formatLKR = (amount) => {
    // Ensure amount is a number and is displayed with 2 decimal places
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        return 'Rs. 0.00'; // Default value if input is invalid
    }
    
    // Use the native Internationalization API for currency formatting
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR', // Sri Lankan Rupee
        minimumFractionDigits: 2,
    }).format(numericAmount);
};