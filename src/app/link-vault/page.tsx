import { FeatureGuard } from "@/components/layout/FeatureGuard";
import LinkVaultPage from "@/features/money-links-vault/pages/LinkVaultPage";

export default function Page() {
  return (
    <FeatureGuard feature="money-links-vault">
      <LinkVaultPage />
    </FeatureGuard>
  );
}
