import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Prevent zooming gestures across iOS, Android, and Desktop webviews/browsers
  const preventAppZoom = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // 1. Prevent iOS Safari / WebKit gesture zoom (pinch to zoom)
    document.addEventListener("gesturestart", preventDefault, { passive: false });
    document.addEventListener("gesturechange", preventDefault, { passive: false });
    document.addEventListener("gestureend", preventDefault, { passive: false });

    // 2. Prevent multi-touch pinch-to-zoom on touchscreens
    document.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // 3. Prevent double-tap to zoom (while allowing normal taps on inputs/textareas)
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      (e: TouchEvent) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          const target = e.target as HTMLElement | null;
          if (target && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
            e.preventDefault();
          }
        }
        lastTouchEnd = now;
      },
      { passive: false }
    );

    // 4. Prevent Ctrl/Cmd + MouseWheel zoom on Desktop / Trackpad pinch
    document.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // 5. Prevent Ctrl/Cmd + (+ / - / 0 / =) keyboard zooming
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")
      ) {
        e.preventDefault();
      }
    });
  };

  preventAppZoom();

  createRoot(document.getElementById("root")!).render(<App />);