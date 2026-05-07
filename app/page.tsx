import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CostIndexWidget } from "@/components/CostIndexWidget";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Tarjouslaskuri maalareille
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted max-w-2xl">
          Laske maalausurakan hinta nopeasti, tallenna tarjous ja palaa siihen
          myöhemmin. Tiedot säilyvät selaimessasi — ei tilejä, ei pilveä.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
          <Link href="/laskuri">
            <Button size="lg">Uusi tarjous</Button>
          </Link>
          <Link href="/tarjoukset">
            <Button size="lg" variant="secondary">
              Tallennetut tarjoukset
            </Button>
          </Link>
        </div>
      </section>

      <CostIndexWidget />

      <section className="grid sm:grid-cols-3 gap-4">
        <FeatureItem
          title="Nopea laskuri"
          body="Lisää huoneet, materiaalit ja työtunnit — loppusumma päivittyy heti."
        />
        <FeatureItem
          title="Tallennetut tarjoukset"
          body="Selain tallentaa tarjouksesi paikallisesti. Avaa, muokkaa tai poista."
        />
        <FeatureItem
          title="Tulostettava"
          body="Tulosta tai tallenna PDF:ksi suoraan selaimesta yhdellä napilla."
        />
      </section>
    </div>
  );
}

function FeatureItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
