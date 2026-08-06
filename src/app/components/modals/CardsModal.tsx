import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Plus, CheckCircle2, Trash2, ShieldCheck, Sparkles } from "lucide-react";
import { useBudgetStore, PaymentCard } from "../../../store/useBudgetStore";

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
  const { cards, addCard, deleteCard } = useBudgetStore();
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
            <div className="backdrop-blur-3xl bg-gradient-to-b from-[#181530]/95 via-[#0F0D24]/98 to-[#090816] border-t border-white/20 rounded-t-[40px] p-6 pt-3 shadow-[0_-12px_50px_rgba(0,229,255,0.25),0_-4px_25px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto pb-12 relative text-white">
              
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />

              <button
                onClick={onClose}
                className="absolute top-5 right-6 w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/15 cursor-pointer hover:bg-white/20 transition-colors z-10"
              >
                <X size={18} className="text-white/80" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E5FF] via-[#7B61FF] to-[#FF4D8D] p-[1px] shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                  <div className="w-full h-full rounded-[15px] bg-[#120F28] flex items-center justify-center">
                    <CreditCard size={22} className="text-[#00E5FF]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-white text-xl font-black tracking-tight flex items-center gap-2">
                    Payment Cards <ShieldCheck size={16} className="text-emerald-400" />
                  </h2>
                  <div className="text-white/50 text-xs tracking-tight">
                    {cards.length === 0 ? "No cards saved" : `${cards.length} Active Card${cards.length > 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>

              {/* Cards List or Empty State */}
              {cards.length === 0 && !showAddCardForm ? (
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center mb-6 backdrop-blur-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-[#7B61FF]/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={32} className="text-[#00E5FF]/70" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">No Payment Cards Added</h3>
                  <p className="text-white/40 text-xs mb-6 max-w-xs mx-auto">
                    Add your actual debit or credit card details to manage payments directly inside Zentro.
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
                <form onSubmit={handleAddCard} className="space-y-4 bg-white/5 p-5 rounded-3xl border border-white/15">
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm font-extrabold tracking-tight flex items-center gap-2">
                      <Sparkles size={16} className="text-[#00E5FF]" /> Add Payment Card
                    </div>
                    <span className="text-white/40 text-[10px]">Secure 256-bit Encrypted</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">Card Number (16 Digits)</label>
                    <input
                      type="text"
                      required
                      placeholder="4532 8910 1112 1314"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                      className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-white text-xs font-mono placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-white/70 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        placeholder="12/28"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                        className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-white text-xs font-mono placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/70 mb-1">Card Network</label>
                      <select
                        value={cardType}
                        onChange={(e) => setCardType(e.target.value as any)}
                        className="w-full bg-[#120F28] border border-white/15 rounded-2xl px-3 py-3 text-white text-xs focus:outline-none focus:border-[#00E5FF]"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Amex">Amex</option>
                      </select>
                    </div>
                  </div>

                  {/* Card Theme Picker */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1.5">Card Theme</label>
                    <div className="grid grid-cols-4 gap-2">
                      {cardGradients.map((g) => (
                        <button
                          key={g.label}
                          type="button"
                          onClick={() => setSelectedGradient(g.value)}
                          className={`h-8 rounded-xl bg-gradient-to-r ${g.value} border flex items-center justify-center transition-all cursor-pointer ${
                            selectedGradient === g.value ? "border-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.4)]" : "border-white/20 opacity-70"
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
                      className="flex-1 py-3 rounded-2xl text-xs bg-white/10 text-white/70 hover:bg-white/15 transition-all cursor-pointer"
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
                    className="w-full py-3.5 rounded-2xl border border-dashed border-white/25 hover:border-white/40 text-white/80 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5 hover:bg-white/10"
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
