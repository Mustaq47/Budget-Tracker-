import { motion, AnimatePresence } from "motion/react";
import { X, User, Check, Sparkles, Shield, Upload } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useBudgetStore } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const avatarPresets = [
  "linear-gradient(135deg, #16A34A 0%, #3B82F6 100%)", // Zentro Green-Blue
  "linear-gradient(135deg, #7B61FF 0%, #00E5FF 100%)", // Cyber Neon Purple-Cyan
  "linear-gradient(135deg, #FF4D8D 0%, #FF8F6B 100%)", // Sunset Orange-Pink
  "linear-gradient(135deg, #FFD166 0%, #F78C6A 100%)", // Peach Gold
  "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)", // Orchid Violet
  "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)", // Deep Ocean
];

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, updateUserProfile, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  
  const [name, setName] = useState(user?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || avatarPresets[0]);
  const [age, setAge] = useState(user?.age ? user.age.toString() : "");
  const [gender, setGender] = useState(user?.gender || "");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getAvatarStyle = (avatar: string) => {
    if (avatar.startsWith("data:image/") || avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return {
        backgroundImage: `url(${avatar})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      background: avatar,
    };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setErrorMsg("Image size must be less than 1MB");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updateUserProfile({
      displayName: name.trim(),
      photoURL: selectedAvatar,
      age: age ? parseInt(age) : null,
      gender: gender || null,
    });
    setSuccessMsg("Profile updated successfully!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1500);
  };

  return createPortal(
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
              
              {/* Top Drag Handle */}
              <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-5" />

              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
              >
                <X size={18} className="text-white/80" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] flex items-center justify-center shadow-[0_0_25px_rgba(123,97,255,0.5)]">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Profile Settings</h2>
                  <div className="text-white/60 text-xs tracking-tight">Customize Your Visual Identity</div>
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="p-5 rounded-3xl bg-white/5 border border-white/10 mb-6 flex flex-col items-center">
                <div 
                  className="w-20 h-20 rounded-full border-4 border-white/10 shadow-xl mb-4 flex items-center justify-center overflow-hidden"
                  style={getAvatarStyle(selectedAvatar)}
                >
                  {!selectedAvatar.startsWith("data:image/") && !selectedAvatar.startsWith("http") && (
                    <User size={40} className="text-white drop-shadow-md" strokeWidth={1.5} />
                  )}
                </div>
                
                <div className="text-white/60 text-xs font-semibold mb-3">Choose Premium Avatar Preset</div>
                <div className="flex gap-2.5 mb-4">
                  {avatarPresets.map((preset) => {
                    const isSelected = selectedAvatar === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedAvatar(preset)}
                        className={`w-9 h-9 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          isSelected ? "border-white scale-110 shadow-lg" : "border-white/10 scale-100 hover:scale-105"
                        }`}
                        style={{ background: preset }}
                      >
                        {isSelected && <Check size={14} className="text-white drop-shadow-sm stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Photo Upload */}
                <div className="w-full border-t border-white/5 pt-3.5 flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="avatar-file-input"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="avatar-file-input"
                    className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl text-[11px] font-bold text-white transition-all flex items-center gap-1.5"
                  >
                    <Upload size={13} /> Upload Custom Photo
                  </label>
                  {errorMsg && (
                    <div className="text-red-400 text-[10px] mt-2 font-semibold">
                      {errorMsg}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Input */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-white/60 text-xs font-bold ml-1 mb-2 block">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter display name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm font-bold tracking-tight outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs font-bold ml-1 mb-2 block">Age</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Age"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm font-bold tracking-tight outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-xs font-bold ml-1 mb-2 block">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white/80 text-sm font-bold tracking-tight outline-none focus:border-white/20 transition-all cursor-pointer [&>option]:bg-[#0B0914] [&>option]:text-white"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <Shield size={16} className="text-emerald-400" />
                  <div>
                    <div className="text-white text-xs font-bold">Anonymous Guest Session</div>
                    <div className="text-white/40 text-[10px]">Data resides locally on your phone storage</div>
                  </div>
                </div>
              </div>

              {successMsg && (
                <div className="text-center text-xs font-semibold text-emerald-400 mb-4 flex items-center justify-center gap-1.5 animate-pulse">
                  <Sparkles size={14} /> {successMsg}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className={`w-full py-4 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  name.trim()
                    ? "bg-gradient-to-r from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] shadow-[0_0_25px_rgba(123,97,255,0.5)] hover:opacity-95"
                    : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                }`}
              >
                Save Changes
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
