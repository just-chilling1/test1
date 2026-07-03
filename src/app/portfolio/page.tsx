import { FeatureGuard } from "@/components/layout/FeatureGuard";
import PortfolioPage from "@/features/portfolio/pages/PortfolioPage";

export default function Page() {
  return (
    <FeatureGuard feature="portfolio">
      <PortfolioPage />
    </FeatureGuard>
  );
}
