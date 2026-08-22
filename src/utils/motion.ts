export const springConfig = {
  type: "spring",
  stiffness: 350,
  damping: 25,
};

export const gentleSpring = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springConfig,
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: gentleSpring },
  exit: { opacity: 0, y: -10, transition: gentleSpring },
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.9, y: 15 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springConfig },
  exit: { opacity: 0, scale: 0.9, y: 15, transition: springConfig },
};

/**
 * Trigger subtle haptic feedback for micro-interactions
 */
export const triggerHaptic = (duration = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // Ignore
    }
  }
};
