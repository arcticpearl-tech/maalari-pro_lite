import { Suspense } from "react";
import { PricingCalculator } from "@/components/PricingCalculator";

export const metadata = {
  title: "Laskuri · MaalariPro Lite",
};

export default function LaskuriPage() {
  return (
    <Suspense fallback={<p className="text-muted">Ladataan…</p>}>
      <PricingCalculator />
    </Suspense>
  );
}
