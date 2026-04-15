import { escapeHTML } from '../utils/html.js';
import { isValidLogType } from '../utils/log.js';

const PREFIX = '[UNDISCORD]';
const MAX_LOG_ENTRIES = 5000;

/**
 * Create the printLog function bound to UI elements.
 * Renders log entries safely: external data is escaped, `<x>` redact tags are preserved.
 * Implements ring buffer: removes oldest entries when exceeding MAX_LOG_ENTRIES.
 * @param {Object} ui - UI element references
 * @param {HTMLElement} ui.logArea - Log container element
 * @param {HTMLInputElement} ui.autoScroll - Auto-scroll checkbox
 * @returns {Function} printLog(type, args)
 */
export function createPrintLog(ui) {
  return function printLog(type = '', args) {
    const safeType = isValidLogType(type) ? type : 'debug';
    const safeHtml = Array.from(args).map(o => {
      if (typeof o === 'object') return escapeHTML(JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)));
      const str = String(o);
      // preserve <x>...</x> redact tags (already escaped inside by redact())
      // escape everything else to prevent XSS from external data
      const parts = str.split(/(<x>.*?<\/x>)/gs);
      return parts.map(part =>
        part.startsWith('<x>') && part.endsWith('</x>') ? part : escapeHTML(part)
      ).join('');
    }).join('\t');
    ui.logArea.insertAdjacentHTML('beforeend', `<div class="log log-${safeType}">${safeHtml}</div>`);

    // ring buffer: trim oldest entries to prevent unbounded DOM growth
    while (ui.logArea.children.length > MAX_LOG_ENTRIES) {
      ui.logArea.removeChild(ui.logArea.firstChild);
    }

    if (ui.autoScroll.checked) ui.logArea.querySelector('div:last-child').scrollIntoView(false);
    if (type === 'error') console.error(PREFIX, ...Array.from(args));
  };
}
