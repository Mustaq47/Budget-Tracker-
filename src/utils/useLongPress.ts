import { useRef, useCallback } from "react";

export interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delayMs?: number;
  vibrateMs?: number;
  moveThreshold?: number;
}

/**
 * useLongPress — Reusable Custom Hook for Touch and Click Long-Press Gestures
 * Handles pointer events, move cancellation, and optional haptic vibration.
 */
export function useLongPress(options: UseLongPressOptions) {
  const {
    onLongPress,
    onClick,
    delayMs = 400,
    vibrateMs = 30,
    moveThreshold = 6,
  } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(() => {
    isLongPressedRef.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      isLongPressedRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate && vibrateMs > 0) {
        navigator.vibrate(vibrateMs);
      }
      onLongPress();
    }, delayMs);
  }, [clearTimer, delayMs, onLongPress, vibrateMs]);

  const onPointerUp = useCallback(() => {
    clearTimer();
    if (!isLongPressedRef.current && onClick) {
      onClick();
    }
    isLongPressedRef.current = false;
  }, [clearTimer, onClick]);

  const onPointerLeave = useCallback(() => {
    clearTimer();
    isLongPressedRef.current = false;
  }, [clearTimer]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (
        Math.abs(e.movementX) > moveThreshold ||
        Math.abs(e.movementY) > moveThreshold
      ) {
        clearTimer();
      }
    },
    [clearTimer, moveThreshold]
  );

  const handleClick = useCallback(
    (e?: React.MouseEvent) => {
      if (isLongPressedRef.current) {
        e?.stopPropagation?.();
        return;
      }
      if (onClick) {
        onClick();
      }
    },
    [onClick]
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel: onPointerLeave,
    onPointerMove,
    onClick: handleClick,
  };
}

