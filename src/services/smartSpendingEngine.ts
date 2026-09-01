import { dinero, allocate, toDecimal, Dinero } from 'dinero.js';
import { Transaction, SavingsGoal, Trip } from '../store/useBudgetStore';
import {
  createMoney,
  addMoney,
  subtractMoney,
  formatMoneyNumber,
  zeroMoney,
  compareMoney
} from '../utils/dineroHelpers';
import {
  getDaysInMonth,
  getRemainingDaysInMonth,
  getTodayLocalString,
  getCurrentMonthPrefix
} from '../utils/dateUtils';

export type RolloverPolicy = 'distribute' | 'accumulate';
export type BudgetStatus = 'HEALTHY' | 'WATCH' | 'CAUTION' | 'CRITICAL' | 'OVER_BUDGET';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SmartSpendingSettings {
  rolloverPolicy: RolloverPolicy;
  emergencyBufferPercent: number; // e.g. 10 for 10%
}

export interface SmartSpendingPlan {
  totalBudget: number;
  actualSpent: number;
  spentToday: number;
  remainingBudget: number;
  futureCommitments: number;
  savingsCommitment: number;
  emergencyBuffer: number;
  spendableAmount: number;
  remainingDays: number;
  baseDailyAllowance: number;
  rolloverAdjustment: number;
  overspendingAdjustment: number;
  behaviorAdjustment: number;
  safeToSpendToday: number;
  projectedMonthEnd: number;
  projectedRemaining: number;
  status: BudgetStatus;
  confidence: ConfidenceLevel;
  explanation: {
    baseAllowanceText: string;
    adjustmentsText: string;
    statusText: string;
  };
}

export function calculateSmartSpendingPlan(params: {
  monthlyBudget: number;
  transactions: Transaction[];
  goals?: SavingsGoal[];
  trips?: Trip[];
  currentDate?: Date;
  settings?: SmartSpendingSettings;
  currency?: string;
}): SmartSpendingPlan {
  const {
    monthlyBudget,
    transactions,
    currentDate = new Date(),
    settings = { rolloverPolicy: 'distribute', emergencyBufferPercent: 10 },
    currency = 'INR'
  } = params;

  const todayLocal = getTodayLocalString(currentDate);
  const currentMonthPrefix = getCurrentMonthPrefix(currentDate);
  const D = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const d = currentDate.getDate();
  const d_rem = getRemainingDaysInMonth(currentDate);

  // 1. Transaction Classifications
  // Completed expenses up to yesterday (strictly in current month)
  const pastExpenses = transactions.filter(t => 
    t.type === 'expense' && 
    t.date.startsWith(currentMonthPrefix) && 
    t.date < todayLocal && 
    !t.tripId && 
    t.category !== 'Goal Contribution'
  );

  // Completed expenses today
  const todayExpenses = transactions.filter(t => 
    t.type === 'expense' && 
    t.date === todayLocal && 
    !t.tripId && 
    t.category !== 'Goal Contribution'
  );

  // Future/planned commitments in current month
  const futureCommitmentsTxs = transactions.filter(t => 
    t.type === 'expense' && 
    t.date.startsWith(currentMonthPrefix) && 
    t.date > todayLocal && 
    !t.tripId && 
    t.category !== 'Goal Contribution'
  );

  // Savings goals contributions logged this month
  const savingsGoalTxs = transactions.filter(t => 
    t.date.startsWith(currentMonthPrefix) && 
    (t.category === 'Goal Contribution' || !!t.goalId)
  );

  // Convert to Dinero objects for safe math
  const budgetD = createMoney(monthlyBudget, currency);
  
  const pastSpentD = pastExpenses.reduce(
    (acc, t) => addMoney(acc, createMoney(t.amount, currency)), 
    zeroMoney(currency)
  );
  
  const todaySpentD = todayExpenses.reduce(
    (acc, t) => addMoney(acc, createMoney(t.amount, currency)), 
    zeroMoney(currency)
  );

  const futureCommitmentsD = futureCommitmentsTxs.reduce(
    (acc, t) => addMoney(acc, createMoney(t.amount, currency)), 
    zeroMoney(currency)
  );

  const savingsD = savingsGoalTxs.reduce(
    (acc, t) => addMoney(acc, createMoney(t.amount, currency)), 
    zeroMoney(currency)
  );

  const completedSpentD = addMoney(pastSpentD, todaySpentD);
  const actualSpent = formatMoneyNumber(completedSpentD);

  // Calculate Remaining Budget
  let remainingBudgetD = subtractMoney(budgetD, completedSpentD);
  if (compareMoney(remainingBudgetD, zeroMoney(currency)).less) {
    remainingBudgetD = zeroMoney(currency);
  }
  const remainingBudget = formatMoneyNumber(remainingBudgetD);

  // Calculate Emergency Buffer
  // Emergency buffer = 10% of monthly budget, capped at what is remaining
  let rawBufferD = budgetD;
  try {
    const allocations = allocate(budgetD, [settings.emergencyBufferPercent, 100 - settings.emergencyBufferPercent]);
    rawBufferD = allocations[0];
  } catch (e) {
    rawBufferD = zeroMoney(currency);
  }

  // Cap buffer at remaining funds before buffer subtraction
  const remainingBeforeBuffer = subtractMoney(
    subtractMoney(subtractMoney(budgetD, pastSpentD), futureCommitmentsD),
    savingsD
  );
  
  let emergencyBufferD = rawBufferD;
  if (compareMoney(remainingBeforeBuffer, rawBufferD).less) {
    emergencyBufferD = compareMoney(remainingBeforeBuffer, zeroMoney(currency)).less 
      ? zeroMoney(currency) 
      : remainingBeforeBuffer;
  }
  const emergencyBuffer = formatMoneyNumber(emergencyBufferD);

  // Calculate Spendable Pool (P)
  let spendablePoolD = subtractMoney(
    subtractMoney(
      subtractMoney(subtractMoney(budgetD, pastSpentD), futureCommitmentsD),
      savingsD
    ),
    emergencyBufferD
  );
  
  if (compareMoney(spendablePoolD, zeroMoney(currency)).less) {
    spendablePoolD = zeroMoney(currency);
  }
  const spendableAmount = formatMoneyNumber(spendablePoolD);

  // Calculate Base Daily Allowance
  let baseDailyAllowance = 0;
  if (d_rem > 0 && formatMoneyNumber(spendablePoolD) > 0) {
    try {
      const allocations = allocate(spendablePoolD, Array(d_rem).fill(1));
      baseDailyAllowance = formatMoneyNumber(allocations[0]);
    } catch {
      baseDailyAllowance = formatMoneyNumber(spendablePoolD) / d_rem;
    }
  }

  // Rollover and Overspending Recovery Calculations
  let rolloverAdjustment = 0;
  let overspendingAdjustment = 0;
  let allowanceD = createMoney(baseDailyAllowance, currency);

  if (settings.rolloverPolicy === 'accumulate') {
    // Ideal static allowance if we spent perfectly without deviations
    const idealPoolD = subtractMoney(
      subtractMoney(subtractMoney(budgetD, emergencyBufferD), savingsD),
      futureCommitmentsD
    );
    let idealDailyAllowance = 0;
    if (idealPoolD && formatMoneyNumber(idealPoolD) > 0) {
      try {
        const allocations = allocate(idealPoolD, Array(D).fill(1));
        idealDailyAllowance = formatMoneyNumber(allocations[0]);
      } catch {
        idealDailyAllowance = formatMoneyNumber(idealPoolD) / D;
      }
    }

    baseDailyAllowance = idealDailyAllowance;
    const idealDailyD = createMoney(idealDailyAllowance, currency);
    
    // Expected cumulative allowance up to yesterday
    let expectedCumulativeD = zeroMoney(currency);
    for (let i = 0; i < d - 1; i++) {
      expectedCumulativeD = addMoney(expectedCumulativeD, idealDailyD);
    }

    // Net balance up to yesterday
    const netBalanceD = subtractMoney(expectedCumulativeD, pastSpentD);
    const balanceVal = formatMoneyNumber(netBalanceD);

    if (balanceVal > 0) {
      // Underspending: Rollover 100% of the surplus to today
      allowanceD = addMoney(idealDailyD, netBalanceD);
      rolloverAdjustment = balanceVal;
    } else if (balanceVal < 0) {
      // Overspending: Distribute the deficit over the remaining days
      const absoluteDeficitD = createMoney(Math.abs(balanceVal), currency);
      let deficitReductionD = zeroMoney(currency);
      if (d_rem > 0) {
        try {
          const allocations = allocate(absoluteDeficitD, Array(d_rem).fill(1));
          deficitReductionD = allocations[0];
        } catch {
          deficitReductionD = createMoney(Math.abs(balanceVal) / d_rem, currency);
        }
      }
      
      allowanceD = subtractMoney(idealDailyD, deficitReductionD);
      if (compareMoney(allowanceD, zeroMoney(currency)).less) {
        allowanceD = zeroMoney(currency);
      }
      overspendingAdjustment = -formatMoneyNumber(deficitReductionD);
    } else {
      allowanceD = idealDailyD;
    }
  }

  // 6. Behavioral Intelligence Layer (Deterministic Adjustment)
  // Calculate average daily spend over last 7 active days of the current month
  const pastSevenDaysTxs = transactions.filter(t => {
    if (t.type !== 'expense' || t.tripId || t.category === 'Goal Contribution') return false;
    const txDate = new Date(t.date);
    const diffTime = currentDate.getTime() - txDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7 && t.date.startsWith(currentMonthPrefix);
  });

  const activeDaysCount = Math.min(d, 7);
  const sevenDaySumD = pastSevenDaysTxs.reduce(
    (acc, t) => addMoney(acc, createMoney(t.amount, currency)),
    zeroMoney(currency)
  );
  
  const sevenDayAverage = activeDaysCount > 0 ? formatMoneyNumber(sevenDaySumD) / activeDaysCount : 0;
  const idealAllowanceVal = monthlyBudget / D;
  const spendingVelocity = idealAllowanceVal > 0 ? sevenDayAverage / idealAllowanceVal : 0;

  // Determine Confidence Level
  // Sourced strictly by data completeness
  const currentMonthAllTxs = transactions.filter(t => t.date.startsWith(currentMonthPrefix));
  let confidence: ConfidenceLevel = 'LOW';
  if (currentMonthAllTxs.length >= 10 && d >= 7) {
    confidence = 'HIGH';
  } else if (currentMonthAllTxs.length >= 4 && d >= 3) {
    confidence = 'MEDIUM';
  }

  let behaviorAdjustment = 0;
  if (spendingVelocity > 1.2 && confidence !== 'LOW') {
    // If spending 20% faster than ideal limit, scale today's allowance down conservatively
    const rawAllowance = formatMoneyNumber(allowanceD);
    const scalingFactor = Math.min(0.15, 0.05 * (spendingVelocity - 1.2));
    behaviorAdjustment = -Math.round(rawAllowance * scalingFactor * 100) / 100;
  }

  // Adjust final allowance with behavioral dampening
  const finalAllowanceD = addMoney(allowanceD, createMoney(behaviorAdjustment, currency));
  
  // Calculate final safeToSpendToday
  let safeToSpendTodayD = subtractMoney(finalAllowanceD, todaySpentD);
  if (compareMoney(safeToSpendTodayD, zeroMoney(currency)).less) {
    safeToSpendTodayD = zeroMoney(currency);
  }
  const safeToSpendToday = formatMoneyNumber(safeToSpendTodayD);

  // 7. Month-End Projection Model
  const dailyAllowanceVal = formatMoneyNumber(allowanceD);
  const projectedSpendVal = actualSpent + (dailyAllowanceVal * Math.max(0, d_rem - 1));
  const projectedMonthEnd = Math.round(projectedSpendVal * 100) / 100;
  const projectedRemaining = Math.max(0, monthlyBudget - projectedMonthEnd);

  // 8. Spending Status Determination
  const utilization = monthlyBudget > 0 ? (projectedMonthEnd / monthlyBudget) * 100 : 0;
  let status: BudgetStatus = 'HEALTHY';
  if (utilization > 100) {
    status = 'OVER_BUDGET';
  } else if (utilization >= 95) {
    status = 'CRITICAL';
  } else if (utilization >= 85) {
    status = 'CAUTION';
  } else if (utilization >= 70) {
    status = 'WATCH';
  }

  // 9. Explanations Generater
  const rolloverPolicyName = settings.rolloverPolicy === 'accumulate' ? '100% Rollover' : 'Distributed Rollover';
  const explanation = {
    baseAllowanceText: `Your starting daily allowance is calculated by dividing your remaining uncommitted spendable pool of ${currency} ${spendableAmount} over the remaining ${d_rem} days of the month.`,
    adjustmentsText: settings.rolloverPolicy === 'accumulate'
      ? `Using ${rolloverPolicyName}: Adjusted for past surplus/deficit. Rollover: +${currency} ${rolloverAdjustment.toFixed(2)}, Overspend recovery: ${overspendingAdjustment.toFixed(2)}, Behavioral throttle: ${behaviorAdjustment.toFixed(2)}.`
      : `Using ${rolloverPolicyName}: Underspending and overspending are automatically distributed across the remaining days of the month.`,
    statusText: `You are projected to finish the month at ${utilization.toFixed(1)}% of your budget. Status is ${status}.`
  };

  return {
    totalBudget: monthlyBudget,
    actualSpent,
    spentToday: formatMoneyNumber(todaySpentD),
    remainingBudget,
    futureCommitments: formatMoneyNumber(futureCommitmentsD),
    savingsCommitment: formatMoneyNumber(savingsD),
    emergencyBuffer,
    spendableAmount,
    remainingDays: d_rem,
    baseDailyAllowance,
    rolloverAdjustment,
    overspendingAdjustment,
    behaviorAdjustment,
    safeToSpendToday,
    projectedMonthEnd,
    projectedRemaining,
    status,
    confidence,
    explanation
  };
}
