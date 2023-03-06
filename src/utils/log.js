
export const log = {
  debug() { return logFn ? logFn('debug', arguments) : console.debug.apply(console, arguments); },
  info() { return logFn ? logFn('info', arguments) : console.info.apply(console, arguments); },
  verb() { return logFn ? logFn('verb', arguments) : console.log.apply(console, arguments); },
  warn() { return logFn ? logFn('warn', arguments) : console.warn.apply(console, arguments); },
  error() { return logFn ? logFn('error', arguments) : console.error.apply(console, arguments); },
  success() { return logFn ? logFn('success', arguments) : console.info.apply(console, arguments); },
};

var logFn; // custom console.log function
export const setLogFn = (fn) => logFn = fn;