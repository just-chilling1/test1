import { FeatureGuard } from "@/components/layout/FeatureGuard";
import CalculatorPage from "@/features/income-calculator/pages/CalculatorPage";

export default function Page() {
  return (
    <FeatureGuard feature="income-calculator">
      <CalculatorPage />
    </FeatureGuard>
  );
}
