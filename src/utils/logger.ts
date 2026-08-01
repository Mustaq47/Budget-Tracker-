/**
 * Application logger utility.
 * Suppresses debug, info, and warn logging in production bundles while preserving critical error reporting.
 */
const isProd = import.meta.env.PROD;

export const logger = {
  debug: (...args: any[]) => {
    if (!isProd) {
      console.debug('[coZify debug]:', ...args);
    }
  },
  info: (...args: any[]) => {
    if (!isProd) {
      console.info('[coZify info]:', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProd) {
      console.warn('[coZify warn]:', ...args);
    }
  },
  error: (...args: any[]) => {
    // Preserve critical error logging in production for diagnostic crash reporting
    console.error('[coZify error]:', ...args);
  },
};
