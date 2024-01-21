// Web Worker code as a string
const workerScript = `
  self.addEventListener('message', function(e) {
    const ms = e.data;
    setTimeout(() => {
      self.postMessage('done');
    }, ms);
  });
`;
// Create a Blob URL for the Web Worker
const blob = new Blob([workerScript], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);

// Helpers
export const wait = ms => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);
    let start = Date.now();
    worker.postMessage(ms);
    worker.addEventListener('message', function(e) {
      if (e.data === 'done') {
        let delay = Date.now() - start - ms;
        if(delay > 100) console.warn(`This action was delayed ${delay}ms more than it should've, make sure you don't have too many tabs open!`);
        resolve();
        worker.terminate();
      }
    });
    worker.addEventListener('error', reject);
  });
};
export const msToHMS = s => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
export const escapeHTML = html => String(html).replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', '\'': '&#039;' })[m]);
export const redact = str => `<x>${escapeHTML(str)}</x>`;
export const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');
export const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));
export const toSnowflake = (date) => /:/.test(date) ? ((new Date(date).getTime() - 1420070400000) * Math.pow(2, 22)) : date;
export const replaceInterpolations = (str, obj, removeMissing = false) => str.replace(/\{\{([\w_]+)\}\}/g, (m, key) => obj[key] || (removeMissing ? '' : m));