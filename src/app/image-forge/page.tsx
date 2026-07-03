import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ImageForgePage from "@/features/image-forge/pages/ImageForgePage";

export default function Page() {
  return (
    <FeatureGuard feature="image-forge">
      <ImageForgePage />
    </FeatureGuard>
  );
}
