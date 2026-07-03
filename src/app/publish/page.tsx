import { Suspense } from "react";
import { FeatureGuard } from "@/components/layout/FeatureGuard";
import PublishArticlePage from "@/features/article-publish/pages/PublishArticlePage";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-text-muted text-sm">
      Loading...
    </div>
  );
}

export default function Page() {
  return (
    <FeatureGuard feature="article-publish">
      <Suspense fallback={<Loading />}>
        <PublishArticlePage />
      </Suspense>
    </FeatureGuard>
  );
}
