export interface IncomeInputs {
  dailyVisitors: number;
  conversionRate: number;
  commissionPerSale: number;
}

export interface IncomeProjection {
  dailySales: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
}

export function calculateIncome({
  dailyVisitors,
  conversionRate,
  commissionPerSale,
}: IncomeInputs): IncomeProjection {
  const dailySales = dailyVisitors * (conversionRate / 100);
  const dailyEarnings = dailySales * commissionPerSale;

  return {
    dailySales,
    dailyEarnings,
    weeklyEarnings: dailyEarnings * 7,
    monthlyEarnings: dailyEarnings * 30,
  };
}

export function formatCurrency(value: number, locale = "en-US", currency = "USD"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
