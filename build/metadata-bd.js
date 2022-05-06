// const pkg = require('../package.json');
import pkg from '../package.json';

//
// Generate BetterDiscord metadata block with information from package.json
// https://github.com/BetterDiscord/BetterDiscord/wiki/Plugin-and-Theme-METAs
// @author victornpb
//

const production = !process.env.ROLLUP_WATCH;

function generateComment(manifest) {
  const largestKey = Object.keys(manifest).reduce((a, b) => a.length > b.length ? a : b).length;
  const generateLine = (key, value) => ` * @${key.padEnd(largestKey, ' ')} ${value}`;
  const lines = Object.entries(manifest).map(([key, value]) => {
    if (Array.isArray(value))
      return value.map(subVal => generateLine(key, subVal)).join('\n');
    return generateLine(key, value);
  }).join('\n');
  return [
    '/**',
    lines,
    ' */',
    '',
  ].join('\n');
}

function publicKeys(obj) {
  const keys = Object.keys(obj).filter(key => !key.startsWith('_'));
  return Object.fromEntries(keys.map(key => [key, obj[key]]));
}

export default () => {
  const metadata = {
    name: pkg.nameFull,
    description: pkg.description,
    version: pkg.version,
    author: pkg.author,
    website: pkg.homepage,
    // license: pkg.license,
    ...publicKeys(pkg.betterDiscord),
  };

  if (!production) {
    delete metadata.source;
    delete metadata.updateUrl;
    metadata.version = new Date().toISOString();
    // metadata.namespace = 'foobar';
  }

  return generateComment(metadata);
};
