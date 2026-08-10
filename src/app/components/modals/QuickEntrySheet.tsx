import { motion, AnimatePresence } from "motion/react";
import { useBudgetStore, currencySymbols } from "../../../store/useBudgetStore";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { getActiveThemeConfig } from "../../../utils/themePresets";
import { v4 as uuidv4 } from "uuid";

interface QuickEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000];
const QUICK_CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment"];

export function QuickEntrySheet({ isOpen, onClose }: QuickEntrySheetProps) {
  const { addTransaction, theme, colorMode, currency } = useBudgetStore();
  const activeTheme = getActiveThemeConfig(theme, colorMode);
  
  const textColor = activeTheme.textColor;
  const subtextColor = activeTheme.subtextColor;
  const isLight = !activeTheme.isDark;

  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState<string>("Food");

  const handleQuickAdd = () => {
    if (!amount || Number(amount) <= 0) return;
    
    addTransaction({
      title: "Quick add",
      amount: Number(amount),
      category: category,
      type: "expense",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    
    setAmount("");
    onClose();
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={`fixed bottom-0 left-0 right-0 z-50 ${activeTheme.bgClass} rounded-t-[28px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t ${isLight ? "border-gray-200" : "border-gray-800"}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`${textColor} text-xl font-bold tracking-tight`}>Quick Expense</h3>
              <button onClick={onClose} className={`p-2 rounded-full ${isLight ? "bg-gray-100 text-gray-600" : "bg-gray-800 text-gray-300"}`}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-center items-center mb-6">
                <span className={`${textColor} text-4xl font-black tracking-tighter`}>{currencySymbols[currency]}</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || "")}
                  className={`w-32 text-4xl font-black bg-transparent border-none outline-none text-center ${textColor} placeholder-gray-400`}
                />
              </div>

              <div className="flex gap-2 justify-center mb-8 flex-wrap">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-transform active:scale-95 ${
                      amount === amt 
                        ? "bg-[#16A34A] text-white shadow-lg shadow-green-500/30" 
                        : isLight ? "bg-gray-100 text-gray-700" : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {QUICK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-transform active:scale-95 ${
                      category === cat 
                        ? "border-2 border-[#16A34A] text-[#16A34A]" 
                        : isLight ? "border-2 border-gray-200 text-gray-600" : "border-2 border-gray-700 text-gray-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={!amount || Number(amount) <= 0}
              className={`w-full py-4 rounded-full font-bold flex justify-center items-center gap-2 transition-transform active:scale-95 ${
                !amount || Number(amount) <= 0 
                  ? "opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
                  : "bg-[#16A34A] text-white shadow-lg shadow-green-500/30"
              }`}
            >
              <Plus size={20} /> Add Expense
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
