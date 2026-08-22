import { dinero, toDecimal, add, subtract, Dinero } from 'dinero.js';
import * as currencies from 'dinero.js/currencies';

export const getCurrencyObj = (cCode: string) => {
  return (currencies as any)[cCode] || (currencies as any).USD;
};

export const toSubunits = (amount: number, currencyObj: any) => {
  const factor = currencyObj.base ** currencyObj.exponent;
  return Math.round(amount * factor);
};

export const formatDinero = (d: Dinero<number>) => {
  return Number(toDecimal(d));
};

export const calculateDineroTotal = (transactions: { amount: number }[], currencyCode: string) => {
  return calculateDineroSum(transactions.map(t => t.amount), currencyCode);
};

export const calculateDineroSum = (amounts: number[], currencyCode: string) => {
  const cObj = getCurrencyObj(currencyCode);
  
  if (amounts.length === 0) return 0;
  
  const totalDinero = amounts.reduce((acc, amt) => {
    const d = dinero({ amount: toSubunits(amt, cObj), currency: cObj });
    return add(acc, d);
  }, dinero({ amount: 0, currency: cObj }));

  return formatDinero(totalDinero);
};

export const calculateDineroBalance = (
  incomeTransactions: { amount: number }[], 
  expenseTransactions: { amount: number }[], 
  currencyCode: string,
  baseAmount: number = 0
) => {
  const cObj = getCurrencyObj(currencyCode);
  const baseDinero = dinero({ amount: toSubunits(baseAmount, cObj), currency: cObj });
  
  const totalIncome = incomeTransactions.reduce((acc, t) => {
    const d = dinero({ amount: toSubunits(t.amount, cObj), currency: cObj });
    return add(acc, d);
  }, dinero({ amount: 0, currency: cObj }));

  const totalExpense = expenseTransactions.reduce((acc, t) => {
    const d = dinero({ amount: toSubunits(t.amount, cObj), currency: cObj });
    return add(acc, d);
  }, dinero({ amount: 0, currency: cObj }));

  let balance = subtract(add(baseDinero, totalIncome), totalExpense);
  
  // If balance is negative, clamp to 0 based on original Math.max(0, income - expense) logic
  if (formatDinero(balance) < 0) {
    balance = dinero({ amount: 0, currency: cObj });
  }

  return formatDinero(balance);
};
