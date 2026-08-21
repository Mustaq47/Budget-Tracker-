const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'utils', 'translations.ts');
let content = fs.readFileSync(file, 'utf8');

const newKeys = {
  dayStreak: "Day Streak!",
  bestDays: "Best: {days} days",
  onFire: "On Fire 🔥",
  spendMoreWeekend: "You tend to spend more on weekends. Consider planning ahead!",
  weekendControlled: "Your weekend spending is well controlled.",
  biggestExpense: "Your biggest expense category is {category}.",
  setBudget: "Set Budget",
  quickAdd: "Quick Add",
  monthlyTarget: "Monthly Target",
  amount: "Amount",
  save: "Save",
  savingsGoals: "Savings Goals",
  addGoal: "Add Goal",
  targetAmount: "Target Amount",
  paymentMethods: "Payment Methods",
  addCard: "Add Card",
  weeklySummary: "Weekly Summary",
  totalSpent: "Total Spent",
  topCategories: "Top Categories",
  keepItUp: "Keep it up!",
  close: "Close",
  setYourBudget: "Set Your Budget",
  firstSavingsGoal: "First Savings Goal",
  setupComplete: "Setup Complete",
  addExpense: "Add Expense",
  title: "Title",
  category: "Category",
  addIncome: "Add Income",
  cardName: "Card Name",
  last4Digits: "Last 4 Digits"
};

const regex = /([a-z]+):\s*\{([^}]*)\}/g;
const newContent = content.replace(regex, (match, lang, inner) => {
  let updatedInner = inner.replace(/\s*$/, '');
  for (const [key, val] of Object.entries(newKeys)) {
    if (!inner.includes(key + ":")) {
      updatedInner += `\n    ${key}: "${val}",`;
    }
  }
  return `${lang}: {${updatedInner}\n  }`;
});

fs.writeFileSync(file, newContent);
console.log('Translations updated.');
