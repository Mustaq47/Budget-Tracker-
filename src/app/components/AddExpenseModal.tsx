import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { GlassIcon } from "./GlassIcon";
import { useState } from "react";
import { useBudgetStore, currencySymbols } from "../../store/useBudgetStore";
import { getCombinedCategories, getCategoryMeta } from "../../utils/categoryConfig";
import { useTranslation } from "../../utils/translations";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [customName, setCustomName] = useState("");
  const { addTransaction, currency, customCategories, addCustomCategory } = useBudgetStore();
  const { t, translateDynamic } = useTranslation();
  const combinedCategories = getCombinedCategories(customCategories);
  const isOtherSelected = combinedCategories[selectedCategory] === "Other";

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    let catLabel = combinedCategories[selectedCategory] || "Other";
    if (catLabel === "Other" && customName.trim()) {
      catLabel = customName.trim();
      addCustomCategory(catLabel);
    }
    const meta = getCategoryMeta(catLabel);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const defaultLabel = t.expenseTitle || 'Expense';
    addTransaction({
      title: catLabel === defaultLabel ? catLabel : `${catLabel} ${defaultLabel}`,
      amount: num,
      category: catLabel,
      time: timeStr,
      type: "expense",
      glow: meta.glow,
    });

    onClose();
    setAmount("");
    setCustomName("");
    setSelectedCategory(0);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] max-w-md mx-auto"
          >
            <div
              className="
              backdrop-blur-[60px]
              bg-gradient-to-b from-white/10 to-white/5
              border-t border-white/20
              rounded-t-[48px]
              p-8
              shadow-default
            "
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10"
              >
                <X size={20} className="text-white/70" />
              </button>

              <div className="mb-8">
                <div className="text-white/60 mb-2 tracking-tight">{t.addExpense || 'Add Expense'}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-white/40 text-4xl">{currencySymbols[currency]}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0"
                    className="
                      bg-transparent
                      border-none
                      outline-none
                      text-white
                      text-6xl
                      tracking-tighter
                      w-full
                      placeholder:text-white/20
                    "
                    autoFocus
                  />
                </div>
                <motion.div
                  className="h-[2px] bg-gradient-to-r from-[#7B61FF] via-[#00E5FF] to-transparent mt-2"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: amount ? 1 : 0 }}
                  style={{ transformOrigin: "left" }}
                />
              </div>

              <div className="mb-8">
                <div className="text-white/60 mb-4 tracking-tight">{t.category || 'Category'}</div>
                <div className="grid grid-cols-4 gap-4">
                  {combinedCategories.map((catLabel, index) => {
                    const meta = getCategoryMeta(catLabel);
                    return (
                      <button
                        key={catLabel}
                        type="button"
                        onClick={() => setSelectedCategory(index)}
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <GlassIcon
                          icon={meta.icon}
                          size="md"
                          active={selectedCategory === index}
                          glow={meta.glow}
                          asChild
                        />
                        <span
                          className={`text-xs tracking-tight transition-all ${
                            selectedCategory === index ? "text-white font-semibold" : "text-white/50"
                          }`}
                        >
                          {translateDynamic(catLabel)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isOtherSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 mb-6 overflow-hidden"
                >
                  <div className="text-white/60 text-xs mb-2 tracking-tight font-medium">
                    {t.newCustomCategory || 'New Custom Category'}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={t.customCategoryPlaceholder || 'e.g. Gym, Pets, Subscriptions...'}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-white/30 focus:border-white/40"
                    />
                    <button
                      type="button"
                      disabled={!customName.trim()}
                      onClick={() => {
                        const trimmed = customName.trim();
                        if (!trimmed) return;
                        addCustomCategory(trimmed);
                        setCustomName("");
                        const updated = getCombinedCategories([...customCategories, trimmed]);
                        const index = updated.indexOf(trimmed);
                        if (index !== -1) setSelectedCategory(index);
                      }}
                      className="px-4 py-3 bg-success disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer"
                    >
                      {t.addAndSelect || 'Add & Select'}
                    </button>
                  </div>
                </motion.div>
              )}

              <motion.button
                onClick={handleSubmit}
                disabled={!amount}
                whileHover={{ scale: amount ? 1.02 : 1 }}
                whileTap={{ scale: amount ? 0.98 : 1 }}
                className={`
                  w-full h-14 rounded-2xl
                  transition-all duration-300
                  tracking-tight cursor-pointer
                  ${
                    amount
                      ? "bg-primary text-white shadow-default"
                      : "bg-white/5 text-white/30 border border-white/10"
                  }
                `}
              >
                {t.addExpense || 'Add Expense'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
