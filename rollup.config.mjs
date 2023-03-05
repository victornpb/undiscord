import fs from 'fs';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import banner from 'rollup-plugin-banner2';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import bakedEnv from 'rollup-plugin-baked-env';
import S from 'tiny-dedent';

import { string } from './build/strings-plugin.mjs';
import userScriptMetadataBlock from './build/metadata.mjs';
const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
let packageJson = loadJSON('./package.json');

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
  devPlugins = [
    {
      buildStart() {
        packageJson = loadJSON('./package.json');
        const DEV_VERSION = `0.${new Date().toISOString().replace(/[-:T]/g, '.').replace('Z', '')}-dev`;
        process.env.VERSION = DEV_VERSION;
      }
    },

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
        const host = address.address === '::1' ? 'localhost' : address.address;
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

      // import html as string
      string({
        include: ['**/*.html'],
      }),

      // import css as string
      string({
        include: ['**/*.css'],
        transform(code, id) {
          // compact CSS
          return code
            .replace(/^\s*\n/gm, '') // remove empty lines
            .replace(/\{\n */g, '{ ') // remove line break after {
            .replace(/;\n */g, '; ') // remove line breaks after ;
            .replace(/;\s(\/\*.+\*\/)\n/g,'; $1 '); // remove line break after comments on properties
        }
      }),
    ]
  },
];

export default config;
