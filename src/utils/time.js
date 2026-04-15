/**
 * Wait for a given number of milliseconds.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const wait = async ms => new Promise(done => setTimeout(done, ms));

/**
 * Convert milliseconds to human-readable "Xh Ym Zs" format.
 * @param {number} s - Milliseconds
 * @returns {string}
 */
export const msToHMS = s => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
