import { Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BottomNav } from "./BottomNav";
import { MandatoryTermsModal } from "./modals/MandatoryTermsModal";
import { useBudgetStore } from "../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../utils/themePresets";
import { useAndroidBackNavigation } from "../hooks/useAndroidBackNavigation";
import { useCloudSync } from "../../features/sync/hooks/useCloudSync";
import { pageTransition } from "../../utils/motion";

import { useEffect } from "react";
import { useTripsStore } from "../../store/useTripsStore";
import { useGoalsStore } from "../../store/useGoalsStore";
import { fetchLatestVersion, compareVersions } from "../../utils/versionCheck";

export function Root() {
  const { theme, colorMode, autoCheckUpdates, appVersion, setActiveModal } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const location = useLocation();

  // Initialize Android native back button listener
  useAndroidBackNavigation();
  
  // Initialize Cloud Sync daemon
  useCloudSync();

  // One-time migration from budtrack-storage-v2 to individual stores
  useEffect(() => {
    try {
      const oldStorageStr = localStorage.getItem('budtrack-storage-v2');
      if (oldStorageStr) {
        const oldStorage = JSON.parse(oldStorageStr);
        if (oldStorage.state) {
          const { trips, goals } = oldStorage.state;
          let migrated = false;
          
          if (trips && Array.isArray(trips) && trips.length > 0) {
            const currentTrips = useTripsStore.getState().trips;
            if (currentTrips.length === 0) {
              useTripsStore.getState().setTrips(trips);
              migrated = true;
            }
          }
          
          if (goals && Array.isArray(goals) && goals.length > 0) {
            const currentGoals = useGoalsStore.getState().goals;
            if (currentGoals.length === 0) {
              useGoalsStore.getState().setGoals(goals);
              migrated = true;
            }
          }
          
          if (migrated) {
            delete oldStorage.state.trips;
            delete oldStorage.state.goals;
            localStorage.setItem('budtrack-storage-v2', JSON.stringify(oldStorage));
          }
        }
      }
    } catch (e) {
      console.warn('Migration check failed:', e);
    }
  }, []);

  // Auto-check for updates on launch
  useEffect(() => {
    if (!autoCheckUpdates) return;
    
    const checkUpdates = async () => {
      const latest = await fetchLatestVersion();
      if (latest && compareVersions(appVersion, latest) > 0) {
        // Only prompt if we haven't already prompted recently (can be added later if needed)
        // For now, just show the modal if there's a newer version
        setActiveModal("app-version");
      }
    };
    
    // Slight delay so it doesn't block initial render
    const timer = setTimeout(checkUpdates, 2000);
    return () => clearTimeout(timer);
  }, [autoCheckUpdates, appVersion, setActiveModal]);

  return (
    <div className={`min-h-screen w-full relative overflow-hidden transition-colors duration-500 ${activeTheme.bgClass}`}>
      {/* Ambient Radial Glow 1 */}
      <div 
        className="absolute inset-0 opacity-40 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${activeTheme.primaryColor}25, transparent 55%)`
        }}
      />
      {/* Ambient Radial Glow 2 */}
      <div 
        className="absolute inset-0 opacity-30 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 100%, ${activeTheme.secondaryColor}20, transparent 50%)`
        }}
      />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            {...pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
      <MandatoryTermsModal />
    </div>
  );
}
