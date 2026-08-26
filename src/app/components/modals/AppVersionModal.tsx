import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Info,
  Shield,
  Zap,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

interface AppVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPDATE_CHECK_URL = "https://cozify-finance.vercel.app/";

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(UPDATE_CHECK_URL, { mode: "cors" });
    const html = await res.text();
    // Try to extract version from meta tag or page content
    const metaMatch = html.match(/data-version="([^"]+)"/);
    if (metaMatch) return metaMatch[1];
    // Fallback: look for version pattern like v1.0.4 or 1.0.4
    const versionMatch = html.match(/v?(\d+\.\d+\.\d+)/);
    if (versionMatch) return versionMatch[1];
    return null;
  } catch {
    return null;
  }
}

function compareVersions(current: string, latest: string): number {
  const c = current.split(".").map(Number);
  const l = latest.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((l[i] || 0) > (c[i] || 0)) return 1;  // update available
    if ((l[i] || 0) < (c[i] || 0)) return -1; // current is newer
  }
  return 0; // same
}

export function AppVersionModal({ isOpen, onClose }: AppVersionModalProps) {
  const { theme, colorMode, appVersion } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;

  const [checking, setChecking] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [checkError, setCheckError] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const updateAvailable =
    latestVersion && compareVersions(appVersion, latestVersion) > 0;

  const handleCheckUpdate = async () => {
    setChecking(true);
    setCheckError(false);
    setLatestVersion(null);
    try {
      const ver = await fetchLatestVersion();
      if (ver) {
        setLatestVersion(ver);
      } else {
        setCheckError(true);
      }
    } catch {
      setCheckError(true);
    } finally {
      setChecking(false);
      setHasChecked(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasChecked(false);
      setLatestVersion(null);
      setCheckError(false);
    }
  }, [isOpen]);

  const handleDownloadUpdate = () => {
    window.open(UPDATE_CHECK_URL, "_blank");
  };

  if (!isOpen) return null;

  const versionDetails = [
    { label: "App Name", value: "coZify — Track • Manage • Grow" },
    { label: "Current Version", value: `v${appVersion}` },

    { label: "Platform", value: "Android / Web PWA" },
    { label: "Architecture", value: "React + Vite + Zustand" },
    { label: "Data Storage", value: "Local-First (Device)" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center"
          onClick={onClose}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-[32px] p-6 pb-10 ${isLight ? "bg-white" : "bg-[#151520]"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeTheme.accentGradient} flex items-center justify-center`}
                >
                  <Smartphone size={20} className="text-white" />
                </div>
                <div>
                  <h2
                    className={`${textColor} text-lg font-bold tracking-tight`}
                  >
                    coZify Version
                  </h2>
                  <p className={`${subtextColor} text-xs`}>
                    App details & updates
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors cursor-pointer ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
              >
                <X
                  size={20}
                  className={isLight ? "text-slate-500" : "text-white/60"}
                />
              </button>
            </div>

            {/* Version Badge */}
            <GlassCard className="mb-4" glow glowColor="blue">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme.primaryColor}33, ${activeTheme.secondaryColor}33)`,
                  }}
                >
                  <span className="text-3xl font-black" style={{ color: activeTheme.primaryColor }}>
                    v
                  </span>
                </div>
                <div>
                  <div
                    className={`${textColor} text-2xl font-black tracking-tighter`}
                  >
                    {appVersion}
                  </div>
                  <div className={`${subtextColor} text-xs font-medium`}>
                    Installed Version
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{
                        color: activeTheme.primaryColor,
                        backgroundColor: `${activeTheme.primaryColor}20`,
                        borderColor: `${activeTheme.primaryColor}40`,
                      }}
                    >
                      <Shield size={9} /> Stable Release
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Version Details */}
            <div className="mb-4">
              <div
                className={`${subtextColor} text-xs font-semibold uppercase tracking-wider mb-2 ml-1`}
              >
                App Details
              </div>
              <GlassCard>
                <div className="space-y-3">
                  {versionDetails.map((detail) => (
                    <div
                      key={detail.label}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`${subtextColor} text-xs font-medium`}
                      >
                        {detail.label}
                      </span>
                      <span
                        className={`${textColor} text-xs font-bold`}
                      >
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Check for Updates */}
            <div className="mb-4">
              <div
                className={`${subtextColor} text-xs font-semibold uppercase tracking-wider mb-2 ml-1`}
              >
                Software Update
              </div>
              <GlassCard>
                <div className="space-y-3">
                  {/* Check button */}
                  <button
                    onClick={handleCheckUpdate}
                    disabled={checking}
                    className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer hover:scale-[1.01]`}
                    style={{
                      background: `linear-gradient(to right, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})`,
                      color: "white",
                      borderColor: "transparent",
                    }}
                  >
                    {checking ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Checking for updates...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Check for Updates
                      </>
                    )}
                  </button>

                  {/* Result: Up to date */}
                  {hasChecked && !checkError && !updateAvailable && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-2xl border"
                      style={{
                        backgroundColor: `${activeTheme.primaryColor}15`,
                        borderColor: `${activeTheme.primaryColor}30`,
                      }}
                    >
                      <CheckCircle2
                        size={20}
                        className="shrink-0"
                        style={{ color: activeTheme.primaryColor }}
                      />
                      <div>
                        <div
                          className="text-sm font-bold"
                          style={{ color: activeTheme.primaryColor }}
                        >
                          You're up to date!
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: `${activeTheme.primaryColor}99` }}
                        >
                          coZify v{appVersion} is the latest version.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Result: Update available */}
                  {hasChecked && updateAvailable && latestVersion && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div
                        className="flex items-center gap-3 p-3 rounded-2xl border"
                        style={{
                          backgroundColor: `${activeTheme.secondaryColor}15`,
                          borderColor: `${activeTheme.secondaryColor}30`,
                        }}
                      >
                        <Zap
                          size={20}
                          className="shrink-0"
                          style={{ color: activeTheme.secondaryColor }}
                        />
                        <div>
                          <div
                            className="text-sm font-bold"
                            style={{ color: activeTheme.secondaryColor }}
                          >
                            Update Available!
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: `${activeTheme.secondaryColor}99` }}
                          >
                            v{latestVersion} is available (you have v
                            {appVersion})
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDownloadUpdate}
                        className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer hover:scale-[1.01]"
                        style={{
                          background: `linear-gradient(to right, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})`,
                          color: "white",
                          borderColor: "transparent",
                        }}
                      >
                        <Download size={16} />
                        Download Latest APK
                        <ExternalLink size={12} />
                      </button>
                    </motion.div>
                  )}


                </div>
              </GlassCard>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <div className={`${subtextColor} text-[10px]`}>
                © 2024–2026 coZify. All rights reserved.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
