import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { App } from "@capacitor/app";
import { toast } from "sonner";
import { useBudgetStore } from "../../store/useBudgetStore";

export function useAndroidBackNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    const setupBackButton = async () => {
      const handler = await App.addListener("backButton", () => {
        if (!isMounted) return;

        const store = useBudgetStore.getState();

        // Priority 0: If pending terms acceptance, exit app if back button is pressed
        if (store.pendingTermsAcceptance) {
          store.logoutUser();
          App.exitApp();
          return;
        }

        // Priority 1: Close active QuickActionModal or sheet
        if (store.activeModal !== null) {
          store.setActiveModal(null);
          return;
        }

        // Priority 2: If on a subroute (e.g. /flow, /insights, /profile), return to Home (/)
        if (location.pathname !== "/" && location.pathname !== "") {
          navigate("/");
          return;
        }

        // Priority 3: On Home screen -> require double tap to exit/minimize app
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          App.minimizeApp();
        } else {
          lastBackPressRef.current = now;
          toast("Press back again to exit", {
            duration: 2000,
          });
        }
      });

      return handler;
    };

    const handlerPromise = setupBackButton();

    return () => {
      isMounted = false;
      handlerPromise.then((handler) => handler.remove());
    };
  }, [navigate, location.pathname]);
}
