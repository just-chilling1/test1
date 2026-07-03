/** Default slider ranges — tune per product */
export const incomeCalculatorDefaults = {
  dailyVisitors: { min: 10, max: 5000, step: 10, default: 100 },
  conversionRate: { min: 0.5, max: 15, step: 0.1, default: 2 },
  commissionPerSale: { min: 5, max: 500, step: 5, default: 47 },
  currency: "USD",
  locale: "en-US",
} as const;
