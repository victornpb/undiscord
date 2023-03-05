import { createFilter } from 'rollup-pluginutils';

export function string(opts = {}) {
  if (!opts.include) {
    throw Error('include option should be specified');
  }

  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'string',

    transform(code, id) {
      if (filter(id)) {
        if (opts.transform) code = opts.transform(code, id, opts);
        return {
          code:  'export default (`\n'+ code + '\n`);',
          map: { mappings: '' }
        };
      }
    }
  };
}