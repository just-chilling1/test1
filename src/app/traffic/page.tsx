import { FeatureGuard } from "@/components/layout/FeatureGuard";
import TrafficHubPage from "@/features/traffic-hub/pages/TrafficHubPage";

export default function Page() {
  return (
    <FeatureGuard feature="traffic-hub">
      <TrafficHubPage />
    </FeatureGuard>
  );
}
