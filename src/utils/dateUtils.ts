export function getDaysInMonth(year: number, month: number): number {
  // JavaScript Date month is 0-indexed. 
  // Passing 0 as day returns the last day of the previous month.
  // E.g. month + 1 is the next month, day 0 is the last day of the current month.
  return new Date(year, month + 1, 0).getDate();
}

export function getRemainingDaysInMonth(currentDate: Date): number {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const totalDays = getDaysInMonth(year, month);
  const currentDay = currentDate.getDate();
  return Math.max(1, totalDays - currentDay + 1); // includes today
}

export function getTodayLocalString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthPrefix(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
