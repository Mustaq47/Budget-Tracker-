/**
 * asyncHandler.ts — Resilient Async & Network Stability Helper
 * Prevents unhandled promise rejections and provides exponential backoff retry for network calls.
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Executes a Promise and returns a [error, result] tuple without throwing.
 * Ensures defensive programming and safe error recovery.
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  fallbackValue?: T
): Promise<[Error | null, T | undefined]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return [error, fallbackValue];
  }
}

/**
 * Retries an asynchronous function with exponential backoff and jitter.
 * Prevents transient network or Firestore timeouts from crashing user actions.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 500,
    maxDelayMs = 5000,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      onRetry?.(attempt, error);

      // Exponential backoff with random jitter to prevent thundering herd
      const backoff = Math.min(
        maxDelayMs,
        baseDelayMs * Math.pow(2, attempt - 1)
      );
      const jitter = Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Operation failed after ${maxRetries} retries: ${String(lastError)}`);
}

/**
 * Determines whether an error is a transient network/offline failure.
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("network") ||
    msg.includes("offline") ||
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("UNAVAILABLE")
  );
}
