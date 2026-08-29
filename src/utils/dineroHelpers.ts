import { dinero, add, subtract, multiply, toDecimal, Dinero, equal, greaterThan, lessThan } from 'dinero.js';
import * as currencies from 'dinero.js/currencies';

export const getCurrencyObj = (cCode: string) => {
  return (currencies as any)[cCode] || (currencies as any).USD;
};

export const toSubunits = (amount: number, currencyObj: any): number => {
  const factor = currencyObj.base ** currencyObj.exponent;
  return Math.round((amount || 0) * factor);
};

export const createMoney = (amountInUnits: number, currencyCode: string): Dinero<number> => {
  const cObj = getCurrencyObj(currencyCode);
  const subunits = toSubunits(amountInUnits, cObj);
  return dinero({ amount: subunits, currency: cObj });
};

export const zeroMoney = (currencyCode: string): Dinero<number> => {
  const cObj = getCurrencyObj(currencyCode);
  return dinero({ amount: 0, currency: cObj });
};

export const addMoney = (d1: Dinero<number>, d2: Dinero<number>): Dinero<number> => {
  return add(d1, d2);
};

export const subtractMoney = (d1: Dinero<number>, d2: Dinero<number>): Dinero<number> => {
  return subtract(d1, d2);
};

export const multiplyMoney = (d: Dinero<number>, multiplier: number): Dinero<number> => {
  return multiply(d, Math.round(multiplier));
};

export const compareMoney = (d1: Dinero<number>, d2: Dinero<number>): { equal: boolean; greater: boolean; less: boolean } => {
  return {
    equal: equal(d1, d2),
    greater: greaterThan(d1, d2),
    less: lessThan(d1, d2),
  };
};

export const formatMoneyNumber = (d: Dinero<number>): number => {
  return Number(toDecimal(d));
};

export const formatMoneyDecimalString = (d: Dinero<number>): string => {
  return toDecimal(d);
};
