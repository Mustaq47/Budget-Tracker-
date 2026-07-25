import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Coffee, Car, Home, Zap, Heart, MoreHorizontal } from "lucide-react";
import { GlassIcon } from "./GlassIcon";
import { useState } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { icon: ShoppingBag, label: "Shopping", glow: "purple" as const },
  { icon: Coffee, label: "Food", glow: "blue" as const },
  { icon: Car, label: "Transport", glow: "pink" as const },
  { icon: Home, label: "Bills", glow: "gold" as const },
  { icon: Zap, label: "Utilities", glow: "purple" as const },
  { icon: Heart, label: "Health", glow: "blue" as const },
  { icon: MoreHorizontal, label: "Other", glow: "pink" as const },
];

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const { addTransaction } = useBudgetStore();

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    const cat = categories[selectedCategory];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    addTransaction({
      title: `${cat.label} Expense`,
      amount: num,
      category: cat.label,
      time: timeStr,
      type: "expense",
      glow: cat.glow,
    });

    onClose();
    setAmount("");
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
              shadow-[0_-8px_40px_rgba(123,97,255,0.4),0_-4px_20px_rgba(0,0,0,0.6)]
            "
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10"
              >
                <X size={20} className="text-white/70" />
              </button>

              <div className="mb-8">
                <div className="text-white/60 mb-2 tracking-tight">Add Expense</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-white/40 text-4xl">₹</span>
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
                <div className="text-white/60 mb-4 tracking-tight">Category</div>
                <div className="grid grid-cols-4 gap-4">
                  {categories.map((category, index) => (
                    <button
                      key={category.label}
                      onClick={() => setSelectedCategory(index)}
                      className="flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <GlassIcon
                        icon={category.icon}
                        size="md"
                        active={selectedCategory === index}
                        glow={category.glow}
                        asChild
                      />
                      <span
                        className={`text-xs tracking-tight transition-all ${
                          selectedCategory === index ? "text-white font-semibold" : "text-white/50"
                        }`}
                      >
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

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
                      ? "bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] text-white shadow-[0_0_30px_rgba(123,97,255,0.6)]"
                      : "bg-white/5 text-white/30 border border-white/10"
                  }
                `}
              >
                Add Expense
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
