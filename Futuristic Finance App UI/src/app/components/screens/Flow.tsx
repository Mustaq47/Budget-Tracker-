import { motion } from "motion/react";
import { GlassIcon } from "../GlassIcon";
import { ShoppingBag, Coffee, Car, Home, Heart, Zap } from "lucide-react";

const flowData = [
  { time: "09:00 AM", title: "Morning Coffee", amount: 120, icon: Coffee, glow: "blue" as const },
  { time: "12:30 PM", title: "Lunch", amount: 450, icon: Coffee, glow: "purple" as const },
  { time: "02:00 PM", title: "Shopping", amount: 2800, icon: ShoppingBag, glow: "pink" as const },
  { time: "05:30 PM", title: "Uber Home", amount: 180, icon: Car, glow: "gold" as const },
  { time: "07:00 PM", title: "Electricity Bill", amount: 1200, icon: Zap, glow: "blue" as const },
  { time: "08:30 PM", title: "Pharmacy", amount: 340, icon: Heart, glow: "purple" as const },
];

export function Flow() {
  return (
    <div className="min-h-screen px-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-white text-3xl tracking-tighter mb-2">Flow</h1>
        <div className="text-white/60 tracking-tight">Your spending timeline</div>
      </motion.div>

      <div className="relative pb-8">
        <div className="absolute left-[27px] top-0 bottom-0 w-[2px]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D] opacity-20" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-[#7B61FF] via-[#00E5FF] to-[#FF4D8D]"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ transformOrigin: "top" }}
          />
        </div>

        <div className="space-y-6">
          {flowData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="relative flex items-start gap-4"
              style={{
                transform: `translateX(${Math.sin(index * 0.5) * 8}px)`,
              }}
            >
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.1 }}
              >
                <GlassIcon icon={item.icon} size="md" glow={item.glow} />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      `0 0 20px rgba(123, 97, 255, 0.0)`,
                      `0 0 30px rgba(123, 97, 255, 0.4)`,
                      `0 0 20px rgba(123, 97, 255, 0.0)`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                />
              </motion.div>

              <motion.div
                className="flex-1 backdrop-blur-[40px] bg-white/5 border border-white/10 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="text-white tracking-tight">{item.title}</div>
                  <div className="text-white tracking-tighter">-₹{item.amount}</div>
                </div>
                <div className="text-white/40 text-xs tracking-tight">{item.time}</div>
                <motion.div
                  className="h-[1px] bg-gradient-to-r from-[#7B61FF]/50 to-transparent mt-3"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                  style={{ transformOrigin: "left" }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-white/40 tracking-tight"
        >
          Total spent today: ₹{flowData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
        </motion.div>
      </div>
    </div>
  );
}
