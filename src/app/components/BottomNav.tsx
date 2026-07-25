import { Home, TrendingUp, Plus, BarChart3, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { GlassIcon } from "./GlassIcon";
import { motion } from "motion/react";
import { useState } from "react";
import { AddExpenseModal } from "./AddExpenseModal";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);

  if (location.pathname === "/login") {
    return null;
  }

  const tabs = [
    { icon: Home, path: "/", label: "Home" },
    { icon: TrendingUp, path: "/flow", label: "Flow" },
    { icon: BarChart3, path: "/insights", label: "Insights" },
    { icon: User, path: "/profile", label: "Profile" },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 pb-6 px-6 pointer-events-none z-50">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="
            max-w-md mx-auto
            backdrop-blur-[40px]
            bg-white/5
            border border-white/10
            rounded-[32px]
            px-6 py-4
            shadow-[0_0_40px_rgba(123,97,255,0.2),0_8px_32px_rgba(0,0,0,0.6)]
            pointer-events-auto
          "
        >
          <div className="flex items-center justify-between relative">
            {tabs.slice(0, 2).map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-1 relative"
              >
                <GlassIcon
                  icon={tab.icon}
                  size="sm"
                  active={location.pathname === tab.path}
                  glow="purple"
                  asChild
                />
                <span
                  className={`text-[10px] tracking-tight transition-all ${
                    location.pathname === tab.path
                      ? "text-white"
                      : "text-white/50"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}

            <motion.button
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                relative
                -mt-8
                w-16 h-16
                rounded-full
                bg-gradient-to-br from-[#7B61FF] to-[#FF4D8D]
                flex items-center justify-center
                shadow-[0_0_40px_rgba(123,97,255,0.8),0_8px_24px_rgba(0,0,0,0.4)]
                border-4 border-[#0a0a1f]
              "
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#FF4D8D] blur-xl"
              />
              <Plus size={28} className="text-white relative z-10" strokeWidth={2.5} />
            </motion.button>

            {tabs.slice(2).map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-1 relative"
              >
                <GlassIcon
                  icon={tab.icon}
                  size="sm"
                  active={location.pathname === tab.path}
                  glow="purple"
                  asChild
                />
                <span
                  className={`text-[10px] tracking-tight transition-all ${
                    location.pathname === tab.path
                      ? "text-white"
                      : "text-white/50"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  );
}
