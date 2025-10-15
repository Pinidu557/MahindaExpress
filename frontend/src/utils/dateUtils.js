import moment from 'moment';

export const MIN_DATE = moment('2025-09-01');
export const MAX_DATE = moment('2100-12-01');

/**
 * Ensures the date is within the allowed range (Sep 2025 to Dec 2100).
 * If outside, it returns the current date.
 * @returns {moment.Moment} The validated or current date.
 */
export const getInitialValidDate = () => {
    const today = moment().startOf('month');
    if (today.isBefore(MIN_DATE) || today.isAfter(MAX_DATE)) {
        return MIN_DATE; // Or simply return today, but MIN_DATE aligns with requirement
    }
    return today;
};

/**
 * Returns the month/year string for the API.
 * @param {moment.Moment} date - The moment object.
 * @returns {string} e.g., "October 2025"
 */
export const formatMonthYear = (date) => {
    return date.format('MMMM YYYY');
};