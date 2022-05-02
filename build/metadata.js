// const pkg = require('../package.json');
import pkg from '../package.json';

//
// Generate metadata block with information from package.json
// https://sourceforge.net/p/greasemonkey/wiki/Metadata_Block/
// @author victornpb
//

const production = !process.env.ROLLUP_WATCH;

function generateComment(manifest) {
  const largestKey = Object.keys(manifest).reduce((a, b) => a.length > b.length ? a : b).length;
  const generateLine = (key, value) => `// @${key.padEnd(largestKey, ' ')} ${value}`;
  const lines = Object.entries(manifest).map(([key, value]) => {
    if (Array.isArray(value))
      return value.map(subVal => generateLine(key, subVal)).join('\n');
    return generateLine(key, value);
  }).join('\n');
  return [
    '// ==UserScript==',
    lines,
    '// ==/UserScript==',
    '',
  ].join('\n');
}

export default () => {
  const metadata = {
    name: pkg.nameFull,
    description: pkg.description,
    version: pkg.version,
    author: pkg.author,
    homepageURL: pkg.homepage,
    supportURL: pkg.bugs.url,
    match: pkg.userScript.match,
    license: pkg.license,
    ...pkg.userScript,
  };

  if (!production) {
    delete metadata.downloadURL;
    delete metadata.updateURL;
    delete metadata.homepageURL;
    metadata.version = new Date().toISOString();
    // metadata.namespace = 'foobar';
  }

  return generateComment(metadata);
};
