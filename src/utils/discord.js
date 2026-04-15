/**
 * Build a URL query string from key-value pairs, filtering out undefined values.
 * @param {Array<[string, *]>} params - Array of [key, value] pairs
 * @returns {string} Encoded query string
 */
export const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');

/**
 * Show a confirmation dialog asynchronously (via setTimeout to avoid blocking).
 * @param {string} msg - Confirmation message
 * @returns {Promise<boolean>}
 */
export const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));

/**
 * Convert a date string to a Discord snowflake ID, or return as-is if already a snowflake.
 * @param {string} date - Date string (with `:`) or snowflake ID
 * @returns {number|string} Snowflake ID
 */
export const toSnowflake = (date) => /:/.test(date) ? ((new Date(date).getTime() - 1420070400000) * Math.pow(2, 22)) : date;
