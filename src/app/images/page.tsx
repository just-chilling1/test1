import { Suspense } from "react";
import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ArticleImagesPage from "@/features/article-images/pages/ArticleImagesPage";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-text-muted text-sm">
      Loading...
    </div>
  );
}

export default function Page() {
  return (
    <FeatureGuard feature="article-images">
      <Suspense fallback={<Loading />}>
        <ArticleImagesPage />
      </Suspense>
    </FeatureGuard>
  );
}
