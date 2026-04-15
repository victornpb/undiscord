/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} html - Raw string
 * @returns {string} Escaped string safe for innerHTML
 */
export const escapeHTML = html => String(html).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#039;' })[m]);

/**
 * Wrap a string in `<x>` tags with HTML-escaped content for streamer mode.
 * The `<x>` tag is styled via CSS to hide content when redact mode is on.
 * @param {string} str - Sensitive string to redact
 * @returns {string} HTML string with `<x>` wrapper
 */
export const redact = str => `<x>${escapeHTML(str)}</x>`;

/**
 * Replace `{{KEY}}` interpolation tokens in a string with values from an object.
 * @param {string} str - Template string
 * @param {Object} obj - Key-value pairs
 * @param {boolean} [removeMissing=false] - Remove unmatched tokens
 * @returns {string}
 */
export const replaceInterpolations = (str, obj, removeMissing = false) => str.replace(/\{\{([\w_]+)\}\}/g, (m, key) => obj[key] ?? (removeMissing ? '' : m));
