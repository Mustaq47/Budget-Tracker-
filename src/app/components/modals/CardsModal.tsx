import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Plus, CheckCircle2, Trash2, ShieldCheck, Sparkles } from "lucide-react";
import { useBudgetStore, PaymentCard } from "../../../store/useBudgetStore";
import { getActiveThemeConfig } from "../../../utils/themePresets";

interface CardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cardGradients = [
  { label: "Nebula", value: "from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D]" },
  { label: "Solar", value: "from-[#FF4D8D] via-[#FFD166] to-[#7B61FF]" },
  { label: "Cyber", value: "from-[#00E5FF] via-[#7B61FF] to-[#A061FF]" },
  { label: "Obsidian", value: "from-[#24243e] via-[#302b63] to-[#0f0c20]" },
];

export function CardsModal({ isOpen, onClose }: CardsModalProps) {
  const { cards, addCard, deleteCard, theme, colorMode } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  const isLight = !activeTheme.isDark;
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardType, setCardType] = useState<"Visa" | "Mastercard" | "Amex">("Visa");
  const [selectedGradient, setSelectedGradient] = useState(cardGradients[0].value);

  const formatCardNumberInput = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    return raw.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiryInput = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    return raw;
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName.trim() || !cardNumber || !expiry) return;

    const rawDigits = cardNumber.replace(/\D/g, "");
    const masked = rawDigits.length === 16
      ? `${rawDigits.slice(0, 4)} •••• •••• ${rawDigits.slice(-4)}`
      : `•••• •••• •••• ${rawDigits.slice(-4) || "0000"}`;

    addCard({
      cardHolder: holderName.trim(),
      cardNumber: masked,
      expiry: expiry.trim(),
      cardType,
      gradient: selectedGradient,
    });

    setHolderName("");
    setCardNumber("");
    setExpiry("");
    setShowAddCardForm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto pointer-events-auto"
          >
            <div
              className={`backdrop-blur-3xl border-t rounded-t-[40px] p-6 pt-3 max-h-[85vh] overflow-y-auto pb-12 relative transition-colors ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-900 shadow-[0_-12px_50px_rgba(0,0,0,0.1)]"
                  : "bg-gradient-to-b from-[#181530]/95 via-[#0F0D24]/98 to-[#090816] border-white/20 text-white shadow-[0_-12px_50px_rgba(0,229,255,0.25)]"
              }`}
            >
              
              {/* Drag Handle */}
              <div className={`w-12 h-1 rounded-full mx-auto mb-5 ${isLight ? "bg-slate-300" : "bg-white/20"}`} />

              <button
                onClick={onClose}
                className={`absolute top-5 right-6 w-9 h-9 rounded-full backdrop-blur-xl flex items-center justify-center border cursor-pointer transition-colors z-10 ${
                  isLight
                    ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                    : "bg-white/10 border-white/15 hover:bg-white/20 text-white/80"
                }`}
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E5FF] via-[#7B61FF] to-[#FF4D8D] p-[1px] shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                  <div className="w-full h-full rounded-[15px] bg-[#120F28] flex items-center justify-center">
                    <CreditCard size={22} className="text-[#00E5FF]" />
                  </div>
                </div>
                <div>
                  <h2 className={`${textColor} text-xl font-black tracking-tight flex items-center gap-2`}>
                    Payment Cards <ShieldCheck size={16} className="text-emerald-500" />
                  </h2>
                  <div className={`${subtextColor} text-xs tracking-tight`}>
                    {cards.length === 0 ? "No cards saved" : `${cards.length} Active Card${cards.length > 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>

              {/* Cards List or Empty State */}
              {cards.length === 0 && !showAddCardForm ? (
                <div
                  className={`p-8 rounded-3xl border text-center mb-6 backdrop-blur-xl ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-[#7B61FF]/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={32} className="text-[#00E5FF]/70" />
                  </div>
                  <h3 className={`${textColor} font-bold text-base mb-1`}>No Payment Cards Added</h3>
                  <p className={`${subtextColor} text-xs mb-6 max-w-[240px] mx-auto`}>
                    Add your Visa, Mastercard, or Amex to manage digital cards cleanly.
                  </p>
                  <button
                    onClick={() => setShowAddCardForm(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-white font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  >
                    <Plus size={16} /> Enter Card Details
                  </button>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {cards.map((card: PaymentCard) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative p-6 rounded-3xl bg-gradient-to-r ${card.gradient} border border-white/30 shadow-[0_12px_35px_rgba(0,0,0,0.5)] text-white overflow-hidden group`}
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/15 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-xs font-black uppercase tracking-widest text-white/90 drop-shadow-sm flex items-center gap-1.5">
                          {card.cardType}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 font-semibold tracking-wide">
                            Active
                          </span>
                          <button
                            onClick={() => deleteCard(card.id)}
                            title="Delete card"
                            className="w-7 h-7 rounded-full bg-black/40 hover:bg-rose-600/80 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                          >
                            <Trash2 size={13} className="text-white/80 hover:text-white" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xl font-mono tracking-widest mb-6 font-bold drop-shadow-md">
                        {card.cardNumber}
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] text-white/70 uppercase font-medium tracking-tight">Cardholder</div>
                          <div className="text-sm font-extrabold tracking-tight capitalize drop-shadow-sm">{card.cardHolder}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-white/70 uppercase font-medium tracking-tight">Expires</div>
                          <div className="text-sm font-extrabold tracking-tight drop-shadow-sm">{card.expiry}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add New Card Form / Trigger */}
              {showAddCardForm ? (
                <form
                  onSubmit={handleAddCard}
                  className={`space-y-4 p-5 rounded-3xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`${textColor} text-sm font-extrabold tracking-tight flex items-center gap-2`}>
                      <Sparkles size={16} className="text-[#00E5FF]" /> Add Payment Card
                    </div>
                    <span className={`${subtextColor} text-[10px]`}>Secure 256-bit Encrypted</span>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className={`w-full border rounded-2xl px-4 py-3 text-xs focus:outline-none transition-all ${
                        isLight
                          ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#00E5FF]"
                          : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-[#00E5FF]"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                      Card Number (16 Digits)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4532 8910 1112 1314"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                      className={`w-full border rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none transition-all ${
                        isLight
                          ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#00E5FF]"
                          : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-[#00E5FF]"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="12/28"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                        className={`w-full border rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none transition-all ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#00E5FF]"
                            : "bg-black/40 border-white/15 text-white placeholder:text-white/30 focus:border-[#00E5FF]"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                        Card Network
                      </label>
                      <select
                        value={cardType}
                        onChange={(e) => setCardType(e.target.value as any)}
                        className={`w-full border rounded-2xl px-3 py-3 text-xs focus:outline-none ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-900 focus:border-[#00E5FF]"
                            : "bg-[#120F28] border-white/15 text-white focus:border-[#00E5FF]"
                        }`}
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Amex">Amex</option>
                      </select>
                    </div>
                  </div>

                  {/* Card Theme Picker */}
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1.5 ${isLight ? "text-slate-700" : "text-white/70"}`}>
                      Card Theme
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {cardGradients.map((g) => (
                        <button
                          key={g.label}
                          type="button"
                          onClick={() => setSelectedGradient(g.value)}
                          className={`h-8 rounded-xl bg-gradient-to-r ${g.value} border flex items-center justify-center transition-all cursor-pointer ${
                            selectedGradient === g.value
                              ? "border-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                              : "border-white/20 opacity-70"
                          }`}
                        >
                          {selectedGradient === g.value && <CheckCircle2 size={14} className="text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCardForm(false)}
                      className={`flex-1 py-3 rounded-2xl text-xs transition-all cursor-pointer ${
                        isLight
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-all"
                    >
                      <CheckCircle2 size={16} /> Save Card
                    </button>
                  </div>
                </form>
              ) : (
                cards.length > 0 && (
                  <button
                    onClick={() => setShowAddCardForm(true)}
                    className={`w-full py-3.5 rounded-2xl border border-dashed font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isLight
                        ? "border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100"
                        : "border-white/25 hover:border-white/40 text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Plus size={16} /> Add Another Payment Card
                  </button>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
