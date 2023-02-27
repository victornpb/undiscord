import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import banner from 'rollup-plugin-banner2';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import bakedEnv from 'rollup-plugin-baked-env';
import S from 'tiny-dedent';

import packageJson from './package.json';
import { string } from './build/strings-plugin';
import userScriptMetadataBlock from './build/metadata.js';

process.env.VERSION = packageJson.version;
const production = !process.env.ROLLUP_WATCH;
const sourcemap = production ? false : 'inline';

const entry = 'src/index.js';

// const assumptions = {
//   constantSuper: true,
//   enumerableModuleMeta: true,
//   ignoreFunctionLength: true,
//   ignoreToPrimitiveHint: true,
//   noClassCalls: true,
//   noDocumentAll: true,
//   noNewArrows: true,
//   privateFieldsAsProperties: true,
//   setClassMethods: true,
//   setComputedProperties: true,
//   setPublicClassFields: true,
// };

let devPlugins = [];
if (!production) {
  const DEV_VERSION = `0.${new Date().toISOString().replace(/[-:T]/g, '.').replace('Z', '')}-dev`;
  process.env.VERSION = DEV_VERSION;

  devPlugins = [
    serve({
    // Launch in browser (default: false)
    // open: true,
      openPage: '/' + packageJson.main,
      // contentBase: 'dist'
      host: 'localhost',
      port: 10001,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      onListening(server) {
        const address = server.address();
        const host = address.address === '::' ? 'localhost' : address.address;
        // by using a bound function, we can access options as `this`
        const protocol = this.https ? 'https' : 'http';
        console.log(S(`
        \n\n
        Live server started...
        _____________________________________________________________
        
        👇 Open this URL to install the development user extension 👇

        ${protocol}://${host}:${address.port}/${packageJson.main}
        _____________________________________________________________
      `));
      }
    }),
    livereload(),
  ];
}

const config = [

  // Modern Module (No babel preset)
  {
    input: entry,
    output: [
      {
        file: packageJson.main,
        format: 'iife',
        sourcemap,
        // exports: 'default',
      },
    ],
    plugins: [
      ...devPlugins,
      bakedEnv(),
      json(),
      resolve(),
      commonjs(),
      banner(userScriptMetadataBlock),
      string({
        // Required to be specified
        include: ['**/*.html', '**/*.css'],
      }),

    ]
  },
];


// generate a markdown table containing output options for the README
function updateReadmeOutputTable() {
  function generateOutputDescription(rollupConfig) {
    const matrixToAsciiTable = require('asciitable.js');
    const gihubTable = {
      row: {
        paddingLeft: '|',
        paddingRight: '|',
        colSeparator: '|',
        lineBreak: '\n'
      },
      cell: {
        paddingLeft: ' ',
        paddingRight: ' ',
        defaultAlignDir: -1
      },
      hr: {
        str: '-',
        colSeparator: '|'
      }
    };
    const header = ['File', 'Module Type', 'Transpiled', 'Source Maps', /*'Import example'*/];
    const lines = [header, null];
    for (const config of rollupConfig) {
      const babel = config.plugins.find(plugin => plugin.name === 'babel');
      const transpiled = babel ? 'Yes' : 'No';
      for (const outputConfig of config.output) {
        const sourceMaps = outputConfig.sourcemap === true ? 'Yes' : 'No';
        // const importExample = outputConfig.format === 'esm' ? `import ${packageJson.globalVar} from '${outputConfig.file}';` : `require('${outputConfig.file}')`;
        lines.push([outputConfig.file, outputConfig.format, transpiled, sourceMaps, /*importExample*/]);
      }
    }
    return matrixToAsciiTable(lines, gihubTable);
  }
  function replaceBetween(str, startString, endString, substitute) {
    const startIndex = str.indexOf(startString);
    const endIndex = str.indexOf(endString, startIndex + startString.length);
    return (startIndex !== -1 && endIndex !== -1) ? str.slice(0, startIndex + startString.length) + substitute + str.slice(endIndex) : str;
  }
  const fs = require('fs');
  const readme = fs.readFileSync('README.md', 'utf8');
  const outputDescription = generateOutputDescription(config);
  const newReadme = replaceBetween(readme, '<!-- Output table (auto generated do not modify) -->', '<!-- END -->', `\n\n${outputDescription}\n\n`);
  fs.writeFileSync('README.md', newReadme);
}

updateReadmeOutputTable();

export default config;
