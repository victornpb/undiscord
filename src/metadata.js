// const pkg = require('../package.json');
import pkg from '../package.json';

//
// Generate metadata block with information from package.json
// https://sourceforge.net/p/greasemonkey/wiki/Metadata_Block/
//

function generateComment(manifest) {
    const largestKey = Object.keys(manifest).reduce((a, b) => a.length > b.length ? a : b).length + 1;
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
    const manifest = {
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
    return generateComment(manifest);
}