const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src', 'app', 'components', 'screens', 'Home.tsx');
let content = fs.readFileSync(homePath, 'utf8');

if (!content.includes('SafeToSpendModal')) {
    content = content.replace(
        'import { GoalsModal } from "../modals/GoalsModal";',
        'import { GoalsModal } from "../modals/GoalsModal";\nimport { SafeToSpendModal } from "../modals/SafeToSpendModal";'
    );
}

const calcRegex = /const todayISO = new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\];\s*const spentToday = transactions\s*\.filter\(\(t\) => t\.type === "expense" && t\.date === todayISO\)\s*\.reduce\(\(sum, t\) => sum \+ t\.amount, 0\);\s*const percentage = Math\.min\(100, Math\.round\(\(spentToday \/ dailyBudget\) \* 100\)\);\s*const isOverBudget = percentage > 80;\s*const circumference = 2 \* Math\.PI \* 140;\s*const strokeDashoffset = circumference - \(circumference \* percentage\) \/ 100;/g;

const newCalc = `  const {
    spentToday,
    remainingToday,
    percentage,
    status,
    feedback
  } = useDailyBudget();
  const isOverBudget = status === "danger";
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;`;

content = content.replace(calcRegex, newCalc);

const ringRegex = /onClick=\{\(\) => \{\s*if \(typeof navigator !== "undefined" && navigator\.vibrate\) \{\s*navigator\.vibrate\(30\);\s*\}\s*setActiveModal\("expense"\);\s*\}\}.*?\{isOverBudget \? "⚠️ Watch your spending" : "✓ You're in control"\}\s*<\/motion\.div>\s*<\/motion\.div>/;

const newRing = `onClick={() => {
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                  navigator.vibrate(30);
                }
                setActiveModal("safe-to-spend");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className={\`\${subtextColor} mb-2 tracking-tight font-semibold\`}>Safe to Spend Today</div>
              <motion.div
                className={\`\${isOverBudget ? "text-red-500" : textColor} text-5xl tracking-tighter mb-2 font-black\`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {currencySymbols[currency]}{remainingToday.toLocaleString()}
              </motion.div>
              <div className={\`\${subtextColor} tracking-tight text-sm font-medium\`}>
                Spent: {currencySymbols[currency]}{spentToday.toLocaleString()} / {currencySymbols[currency]}{dailyBudget.toLocaleString()}
              </div>
              <motion.div
                className={\`mt-4 px-4 py-2 rounded-full backdrop-blur-xl \${
                  status === "danger"
                    ? "bg-red-500/20 text-red-600 border border-red-500/30 font-bold"
                    : status === "warning"
                    ? "bg-amber-500/20 text-amber-600 border border-amber-500/30 font-bold"
                    : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 font-bold"
                } tracking-tight text-xs\`}
                animate={status === "danger" ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {status === "danger" ? "⚠️ Budget Exceeded" : feedback}
              </motion.div>
            </motion.div>`;

content = content.replace(ringRegex, newRing);

if (!content.includes('<SafeToSpendModal')) {
    content = content.replace(
        '{/* Quick Action Modals */}',
        '{/* Quick Action Modals */}\n      <SafeToSpendModal isOpen={activeModal === "safe-to-spend"} onClose={() => setActiveModal(null)} />'
    );
}

fs.writeFileSync(homePath, content, 'utf8');
console.log("Successfully updated Home.tsx");
