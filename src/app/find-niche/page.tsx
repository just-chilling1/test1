import { FeatureGuard } from "@/components/layout/FeatureGuard";
import FindNichePage from "@/features/niche-finder/pages/FindNichePage";

export default function Page() {
  return (
    <FeatureGuard feature="niche-finder">
      <FindNichePage />
    </FeatureGuard>
  );
}
