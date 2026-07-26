import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";
import { useBudgetStore } from "../../store/useBudgetStore";
import { themeMap } from "../../utils/themePresets";

export function Root() {
  const { theme } = useBudgetStore();
  const activeTheme = themeMap[theme] || themeMap["cyber-neon"];

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
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}
