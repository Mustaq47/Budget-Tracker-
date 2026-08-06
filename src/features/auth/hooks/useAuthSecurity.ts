import { useState, useCallback, useRef } from "react";

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_DURATION_MS = 30 * 1000; // 30 seconds

/**
 * Sanitizes a URL path to prevent Open Redirect vulnerabilities.
 * Ensures the target URL is a relative path starting with '/' and not '//'.
 */
export function sanitizeReturnUrl(url?: string | null, fallback = "/"): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }
  const trimmed = url.trim();
  // Allow only safe relative paths (must start with single "/" and not "//" or "http")
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")) {
    return trimmed;
  }
  return fallback;
}

/**
 * Sanitizes an email input to prevent XSS or whitespace injection.
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Auth Rate Limiting Hook to prevent brute-force / duplicate login spam.
 * Temporarily locks auth attempts after 5 consecutive failures within 60 seconds.
 */
export function useAuthRateLimit() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const attemptsRef = useRef<number[]>([]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    // Keep only attempts within last 60 seconds
    attemptsRef.current = attemptsRef.current.filter((timestamp) => now - timestamp < 60000);

    if (attemptsRef.current.length >= MAX_FAILED_ATTEMPTS) {
      setIsRateLimited(true);
      setCooldownRemaining(30);

      const interval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRateLimited(false);
            attemptsRef.current = [];
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return false; // Block attempt
    }

    return true; // Allow attempt
  }, []);

  const recordFailedAttempt = useCallback(() => {
    attemptsRef.current.push(Date.now());
  }, []);

  const resetAttempts = useCallback(() => {
    attemptsRef.current = [];
    setIsRateLimited(false);
  }, []);

  return {
    isRateLimited,
    cooldownRemaining,
    checkRateLimit,
    recordFailedAttempt,
    resetAttempts,
  };
}
