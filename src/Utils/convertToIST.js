import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend Day.js with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Converts a UTC date to Indian Standard Time (IST).
 * 
 * @param {string | Date} utcDate - The UTC date to be converted.
 * @returns {string} - The converted IST date in 'YYYY-MM-DD HH:mm:ss' format.
 */
export const convertToIST = (utcDate) => {
    if (!utcDate) {
        throw new Error("Invalid date provided.");
    }
    return dayjs(utcDate).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
};
