import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Download, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { useTripsStore } from "../../../store/useTripsStore";
import { useGoalsStore } from "../../../store/useGoalsStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { useState } from "react";
import { logger } from "../../../utils/logger";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const { 
    transactions, dailyBudget, wipeAllData,
    theme, colorMode, appVersion
  } = useBudgetStore();
  const { trips, wipeTrips } = useTripsStore();
  const { goals, wipeGoals } = useGoalsStore();
  
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  
  const [confirmStep, setConfirmStep] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const handleExportData = () => {
    try {
      const backupData = {
        version: appVersion,
        exportDate: new Date().toISOString(),
        dailyBudget,
        transactions,
        trips,
        goals,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cozify_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setSuccessMsg("Backup downloaded successfully!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      logger.error("Export data error:", err);
    }
  };

  const handleWipeData = () => {
    if (confirmStep < 2) {
      setConfirmStep(confirmStep + 1);
    } else {
      // Execute wipe
      wipeAllData();
      wipeTrips();
      wipeGoals();
      setSuccessMsg("All local data wiped!");
      setTimeout(() => {
        setSuccessMsg("");
        setConfirmStep(0);
        window.location.reload();
      }, 1500);
    }
  };

  const cancelWipe = () => {
    setConfirmStep(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              cancelWipe();
              onClose();
            }}
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
                onClick={() => {
                  cancelWipe();
                  onClose();
                }}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
              >
                <X size={18} className="text-white/80" />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] flex items-center justify-center shadow-[0_0_25px_rgba(123,97,255,0.5)]">
                  <Lock size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Privacy & Security</h2>
                  <div className="text-white/60 text-xs tracking-tight">Export, Wipe & Control Your Vault</div>
                </div>
              </div>

              {/* Security info cards */}
              <div className="space-y-4 mb-6">
                
                {/* Information Card */}
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-bold">Encrypted Vault</div>
                    <div className="text-white/50 text-[11px] leading-relaxed">
                      coZify works local-first. All credit card tokens, balance states, and transaction histories reside on device storage.
                    </div>
                  </div>
                </div>

                {/* Export Data Card */}
                <button
                  onClick={handleExportData}
                  className="w-full text-left p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/15 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center">
                      <Download size={18} className="text-[#00E5FF]" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">Export Backup Vault</div>
                      <div className="text-white/40 text-[10px]">Download all transactions & trips as JSON</div>
                    </div>
                  </div>
                </button>

                {/* Wipe Data Card */}
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <Trash2 size={18} className="text-red-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-bold">Destructive Wipe</div>
                        <div className="text-white/40 text-[10px]">Delete all local transactions & reset cache</div>
                      </div>
                    </div>

                    {confirmStep === 0 && (
                      <button
                        onClick={handleWipeData}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Wipe Data
                      </button>
                    )}
                  </div>

                  {confirmStep > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-2">
                        <AlertTriangle size={14} />
                        {confirmStep === 1 ? "First Confirmation Required" : "FINAL WARNING: IRREVERSIBLE"}
                      </div>
                      <p className="text-white/50 text-[10px] leading-relaxed mb-3">
                        {confirmStep === 1 
                          ? "Are you absolutely sure you want to delete all local transaction logs, limits, and profiles?" 
                          : "This deletes all local data permanently. Do you wish to proceed?"}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleWipeData}
                          className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md hover:bg-red-600 transition-colors"
                        >
                          {confirmStep === 1 ? "Yes, I Am Sure" : "WIPE EVERYTHING"}
                        </button>
                        <button
                          onClick={cancelWipe}
                          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {successMsg && (
                <div className="text-center text-xs font-semibold text-[#00E5FF] mb-4 flex items-center justify-center gap-1.5 animate-pulse">
                  <ShieldCheck size={14} className="text-emerald-400" /> {successMsg}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  cancelWipe();
                  onClose();
                }}
                className="w-full py-4 rounded-2xl font-black text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Close Panel
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
