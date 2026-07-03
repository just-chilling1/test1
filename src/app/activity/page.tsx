import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ActivityPage from "@/features/b2b-outreach/pages/ActivityPage";

export default function Page() {
  return (
    <FeatureGuard feature="b2b-outreach">
      <ActivityPage />
    </FeatureGuard>
  );
}
