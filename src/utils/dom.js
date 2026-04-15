/**
 * Parse an HTML string and return the first element.
 * @param {string} html - HTML string
 * @returns {HTMLElement}
 */
export function createElm(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.removeChild(temp.firstElementChild);
}

/**
 * Inject a CSS string into the document head as a `<style>` element.
 * @param {string} css - CSS string
 * @returns {HTMLStyleElement}
 */
export function insertCss(css) {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
  return style;
}
