import { FeatureGuard } from "@/components/layout/FeatureGuard";
import SavedEmailsPage from "@/features/b2b-outreach/pages/SavedEmailsPage";

export default function Page() {
  return (
    <FeatureGuard feature="b2b-outreach">
      <SavedEmailsPage />
    </FeatureGuard>
  );
}
