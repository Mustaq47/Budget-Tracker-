import { Home, TrendingUp, Plus, BarChart3, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { GlassIcon } from "./GlassIcon";
import { motion } from "motion/react";
import { useState } from "react";
import { QuickEntrySheet } from "./modals/QuickEntrySheet";
import { useBudgetStore } from "../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../utils/themePresets";
import { useAccessibleAnimation, SPRING_PHYSICS, FAST_SPRING } from "../utils/motionConfig";
import { useTranslation } from "../../utils/translations";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const { activeModal, setActiveModal, theme, colorMode } = useBudgetStore();
  const isReducedMotion = useAccessibleAnimation();
  const { t } = useTranslation();

  if (location.pathname === "/login" || location.pathname === "/onboarding" || location.pathname.startsWith("/admin")) {
    return null;
  }

  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  const isModalOpen = activeModal !== null || showAddModal;

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setActiveModal("expense");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    if (activeModal === "expense") {
      setActiveModal(null);
    }
  };

  const tabs = [
    { icon: Home, path: "/", label: t.home },
    { icon: TrendingUp, path: "/flow", label: t.flow },
    { icon: BarChart3, path: "/insights", label: t.insights },
    { icon: User, path: "/profile", label: t.profile },
  ];

  const navContainerBg = isLight
    ? "bg-white/90 border border-slate-200/90 shadow-xl text-slate-900"
    : `${activeTheme.cardBg}`;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 pb-6 px-6 pointer-events-none z-50 overflow-hidden">
        <motion.div
          initial={{ y: isReducedMotion ? 0 : 100 }}
          animate={{ y: isModalOpen ? 180 : 0 }}
          transition={SPRING_PHYSICS}
          className={`
            max-w-md mx-auto
            backdrop-blur-[40px]
            rounded-[32px]
            px-6 py-4
            ${navContainerBg}
            pointer-events-auto
          `}
        >
          <div className="flex items-center justify-between relative">
            {tabs.slice(0, 2).map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-1 relative cursor-pointer"
              >
                <GlassIcon
                  icon={tab.icon}
                  size="sm"
                  active={location.pathname === tab.path}
                  glow="purple"
                  asChild
                />
                <span
                  className={`text-[10px] tracking-tight font-bold transition-all ${
                    location.pathname === tab.path
                      ? isLight ? "text-slate-900" : "text-white"
                      : isLight ? "text-slate-500" : "text-white/50"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}

            <motion.button
              onClick={handleOpenAddModal}
              whileHover={{ scale: isReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: isReducedMotion ? 1 : 0.95 }}
              transition={FAST_SPRING}
              className={`
                relative
                -mt-8
                w-16 h-16
                rounded-full
                bg-gradient-to-br from-[#16A34A] to-[#3B82F6]
                flex items-center justify-center
                shadow-xl
                border-4 ${isLight ? "border-slate-100" : "border-[#0a0a1f]"}
                cursor-pointer
              `}
            >
              <Plus size={28} className="text-white relative z-10" strokeWidth={2.5} />
            </motion.button>

            {tabs.slice(2).map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-1 relative cursor-pointer"
              >
                <GlassIcon
                  icon={tab.icon}
                  size="sm"
                  active={location.pathname === tab.path}
                  glow="purple"
                  asChild
                />
                <span
                  className={`text-[10px] tracking-tight font-bold transition-all ${
                    location.pathname === tab.path
                      ? isLight ? "text-slate-900" : "text-white"
                      : isLight ? "text-slate-500" : "text-white/50"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <QuickEntrySheet
        isOpen={showAddModal || activeModal === "expense"}
        onClose={handleCloseAddModal}
      />
    </>
  );
}
