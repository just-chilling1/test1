import { FeatureGuard } from "@/components/layout/FeatureGuard";
import LaunchpadPage from "@/features/launchpad/pages/LaunchpadPage";

export default function Page() {
  return (
    <FeatureGuard feature="launchpad">
      <LaunchpadPage />
    </FeatureGuard>
  );
}
