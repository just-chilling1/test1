import { FeatureGuard } from "@/components/layout/FeatureGuard";
import OffersPage from "@/features/b2b-outreach/pages/OffersPage";

export default function Page() {
  return (
    <FeatureGuard feature="b2b-outreach">
      <OffersPage />
    </FeatureGuard>
  );
}
