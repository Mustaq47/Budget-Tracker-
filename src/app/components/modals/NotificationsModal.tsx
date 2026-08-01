import { motion, AnimatePresence } from "motion/react";
import { X, Bell, ShieldAlert, Calendar, Check, Sparkles } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useState } from "react";
import { logger } from "../../../utils/logger";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { theme, colorMode, notificationSettings, updateNotificationSettings } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;

  const [toastMsg, setToastMsg] = useState("");

  const handleToggle = async (key: 'dailyReminder' | 'budgetAlerts' | 'weeklySummary') => {
    const newValue = !notificationSettings[key];
    updateNotificationSettings({ [key]: newValue });

    if (key === 'dailyReminder') {
      if (newValue) {
        // Enable Daily Reminder
        if (Capacitor.isNativePlatform()) {
          try {
            const check = await LocalNotifications.checkPermissions();
            let status = check.display;
            if (status !== 'granted') {
              const req = await LocalNotifications.requestPermissions();
              status = req.display;
            }

            if (status === 'granted') {
              await LocalNotifications.schedule({
                notifications: [
                  {
                    id: 1,
                    title: "coZify Budget Tracker 💰",
                    body: "Time to log today's expenses and check your savings goals!",
                    schedule: {
                      on: { hour: 20, minute: 0 },
                      repeats: true
                    }
                  }
                ]
              });
              setToastMsg("Daily reminder scheduled at 8:00 PM!");
            } else {
              setToastMsg("Notification permission denied.");
              updateNotificationSettings({ dailyReminder: false });
            }
          } catch (err) {
            logger.warn("Notifications schedule error:", err);
            setToastMsg("Local notifications not available.");
            updateNotificationSettings({ dailyReminder: false });
          }
        } else {
          setToastMsg("Reminder active (mocked on Web)");
        }
      } else {
        // Disable Daily Reminder
        if (Capacitor.isNativePlatform()) {
          try {
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
          } catch (err) {
            logger.warn("Notifications cancel error:", err);
          }
        }
        setToastMsg("Daily reminder disabled.");
      }
      setTimeout(() => setToastMsg(""), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto"
          >
            <div className="backdrop-blur-[60px] bg-gradient-to-b from-white/12 via-white/8 to-[#0B0914] border-t border-white/20 rounded-t-[48px] p-7 shadow-[0_-10px_50px_rgba(123,97,255,0.35),0_-4px_20px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto">
              
              <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-5" />

              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
              >
                <X size={18} className="text-white/80" />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] flex items-center justify-center shadow-[0_0_25px_rgba(123,97,255,0.5)]">
                  <Bell size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Notification Settings</h2>
                  <div className="text-white/60 text-xs tracking-tight">Alerts, Reminders & Weekly Digests</div>
                </div>
              </div>

              {/* Toggles Container */}
              <div className="space-y-4 mb-6">
                
                {/* Toggle 1: Daily Reminder */}
                <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/10 border border-[#7B61FF]/20 flex items-center justify-center">
                      <Bell size={18} className="text-[#7B61FF]" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">Daily Reminder</div>
                      <div className="text-white/40 text-[10px]">Prompt to add transactions at 8 PM</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('dailyReminder')}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                      notificationSettings.dailyReminder ? "bg-emerald-500" : "bg-white/15"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notificationSettings.dailyReminder ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Budget Alerts */}
                <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center">
                      <ShieldAlert size={18} className="text-[#00E5FF]" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">Budget Alerts</div>
                      <div className="text-white/40 text-[10px]">Warn when daily spent exceeds 80%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('budgetAlerts')}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                      notificationSettings.budgetAlerts ? "bg-emerald-500" : "bg-white/15"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notificationSettings.budgetAlerts ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: Weekly Summary */}
                <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FF4D8D]/10 border border-[#FF4D8D]/20 flex items-center justify-center">
                      <Calendar size={18} className="text-[#FF4D8D]" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">Weekly Digest</div>
                      <div className="text-white/40 text-[10px]">Monday morning spending insights</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('weeklySummary')}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                      notificationSettings.weeklySummary ? "bg-emerald-500" : "bg-white/15"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notificationSettings.weeklySummary ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

              </div>

              {toastMsg && (
                <div className="text-center text-xs font-semibold text-[#00E5FF] mb-4 flex items-center justify-center gap-1.5 animate-pulse">
                  <Sparkles size={14} /> {toastMsg}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-xs bg-gradient-to-r from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] text-white shadow-[0_0_25px_rgba(123,97,255,0.5)] flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
              >
                Apply Notification Settings
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
