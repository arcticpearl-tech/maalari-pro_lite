"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  calculateTotals,
  formatDate,
  formatEuro,
  lineSubtotal,
  VAT_RATE,
} from "@/lib/pricing";
import { getOffer } from "@/lib/storage";
import type { Offer } from "@/lib/types";

export function OfferDetail({ id }: { id: string }) {
  const [offer, setOffer] = useState<Offer | null | undefined>(undefined);

  useEffect(() => {
    setOffer(getOffer(id) ?? null);
  }, [id]);

  if (offer === undefined) {
    return <p className="text-muted">Ladataan…</p>;
  }

  if (offer === null) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium">Tarjousta ei löytynyt</h2>
        <p className="text-muted mt-1">
          Tarjous on voitu poistaa tai linkki on vanhentunut.
        </p>
        <div className="mt-6">
          <Link href="/tarjoukset">
            <Button variant="secondary">Takaisin tarjouksiin</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totals = calculateTotals(offer);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-between items-center no-print">
        <Link href="/tarjoukset">
          <Button variant="ghost" size="sm">
            ← Takaisin
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/laskuri?id=${offer.id}`}>
            <Button variant="secondary" size="sm">
              Muokkaa
            </Button>
          </Link>
          <Button size="sm" onClick={() => window.print()}>
            Tulosta
          </Button>
        </div>
      </div>

      <article className="bg-surface border border-border rounded-lg p-6 sm:p-10 space-y-8">
        <header className="flex flex-wrap justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Tarjous</p>
            <h1 className="text-2xl font-semibold mt-1">{offer.projectName}</h1>
            <p className="text-sm text-muted mt-1">
              Päiväys: {formatDate(offer.createdAt)}
            </p>
          </div>
          <div className="text-sm text-right">
            <p className="text-muted">Asiakas</p>
            <p className="font-medium text-foreground">{offer.customerName}</p>
          </div>
        </header>

        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Erittely
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 font-medium">Kuvaus</th>
                <th className="py-2 font-medium text-right">m²</th>
                <th className="py-2 font-medium text-right">€/m²</th>
                <th className="py-2 font-medium text-right">Yhteensä</th>
              </tr>
            </thead>
            <tbody>
              {offer.lines.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="py-2">{l.description || "—"}</td>
                  <td className="py-2 text-right tabular-nums">{l.area}</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatEuro(l.pricePerM2)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatEuro(lineSubtotal(l))}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-border/60">
                <td className="py-2" colSpan={3}>
                  Materiaalit
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatEuro(offer.materialsCost)}
                </td>
              </tr>
              <tr>
                <td className="py-2" colSpan={3}>
                  Työ ({offer.laborHours} h × {formatEuro(offer.hourlyRate)})
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatEuro(totals.laborCost)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="ml-auto max-w-sm space-y-1.5 text-sm">
          <Row label="Välisumma" value={formatEuro(totals.subtotal)} />
          <Row
            label={`Kate ${offer.marginPercent} %`}
            value={formatEuro(totals.marginAmount)}
          />
          <Row label="Veroton" value={formatEuro(totals.netTotal)} bold />
          <Row
            label={`ALV ${(VAT_RATE * 100).toFixed(1).replace(".", ",")} %`}
            value={formatEuro(totals.vatAmount)}
          />
          <hr className="border-border my-2" />
          <Row label="Loppusumma" value={formatEuro(totals.total)} bold big />
        </section>
      </article>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  big,
}: {
  label: string;
  value: string;
  bold?: boolean;
  big?: boolean;
}) {
  return (
    <div
      className={
        "flex justify-between items-baseline " +
        (bold ? "font-semibold text-foreground " : "text-muted ") +
        (big ? "text-lg" : "")
      }
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
