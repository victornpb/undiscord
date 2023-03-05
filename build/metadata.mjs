import fs from 'fs';
const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));


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

export default function userScriptMetadataBlock() {
  const pkg = loadJSON('../package.json');

  const metadata = {
    name: pkg.nameFull,
    description: pkg.description,
    version: process.env.VERSION,
    author: pkg.author,
    homepageURL: pkg.homepage,
    supportURL: pkg.bugs.url,
    match: pkg.userScript.match,
    license: pkg.license,
    ...pkg.userScript,
  };

  if (!production) {
    metadata.name = metadata.name + ' [DEV]';
    metadata.namespace = metadata.namespace + '_DEV';

    delete metadata.downloadURL;
    delete metadata.updateURL;
    delete metadata.homepageURL;

    metadata.downloadURL = metadata.updateURL = metadata.homepageURL = 'http://localhost:10001/deleteDiscordMessages.user.js';
  }

  return generateComment(metadata);
}