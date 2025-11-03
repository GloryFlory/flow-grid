const DEBUG_ENABLED = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';

export const logDebug = (...args: unknown[]) => {
  if (!DEBUG_ENABLED) return;
  console.debug(...args);
};

export const logInfo = (...args: unknown[]) => {
  if (!DEBUG_ENABLED) return;
  console.info(...args);
};

export const logWarn = (...args: unknown[]) => {
  if (!DEBUG_ENABLED) return;
  console.warn(...args);
};

export const logError = (...args: unknown[]) => {
  console.error(...args);
};
