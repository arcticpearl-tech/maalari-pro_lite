import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { OfferList } from "@/components/OfferList";

export const metadata = {
  title: "Tarjoukset · MaalariPro Lite",
};

export default function TarjouksetPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Tallennetut tarjoukset
        </h1>
        <Link href="/laskuri">
          <Button>Uusi tarjous</Button>
        </Link>
      </div>
      <OfferList />
    </div>
  );
}
