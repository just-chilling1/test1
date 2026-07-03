import { FeatureGuard } from "@/components/layout/FeatureGuard";
import CreateArticlePage from "@/features/article-wizard/pages/CreateArticlePage";

export default function Page() {
  return (
    <FeatureGuard feature="article-wizard">
      <CreateArticlePage />
    </FeatureGuard>
  );
}
