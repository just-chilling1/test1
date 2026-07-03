import { Suspense } from "react";
import { FeatureGuard } from "@/components/layout/FeatureGuard";
import EmailBuilderPage from "@/features/b2b-outreach/pages/EmailBuilderPage";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-text-muted text-sm">
      Loading...
    </div>
  );
}

export default function Page() {
  return (
    <FeatureGuard feature="b2b-outreach">
      <Suspense fallback={<Loading />}>
        <EmailBuilderPage />
      </Suspense>
    </FeatureGuard>
  );
}
