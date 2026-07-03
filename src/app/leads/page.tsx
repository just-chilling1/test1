import { FeatureGuard } from "@/components/layout/FeatureGuard";
import LeadsPage from "@/features/b2b-outreach/pages/LeadsPage";

export default function Page() {
  return (
    <FeatureGuard feature="b2b-outreach">
      <LeadsPage />
    </FeatureGuard>
  );
}
