"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { calculateTotals, formatDate, formatEuro } from "@/lib/pricing";
import {
  deleteOffer,
  getOffers,
  seedDemoOffersIfNeeded,
} from "@/lib/storage";
import type { Offer } from "@/lib/types";

export function OfferList() {
  const [offers, setOffers] = useState<Offer[] | null>(null);

  function refresh() {
    setOffers(getOffers());
  }

  useEffect(() => {
    seedDemoOffersIfNeeded();
    refresh();
  }, []);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Poistetaanko tarjous "${name}"?`)) return;
    deleteOffer(id);
    refresh();
  }

  if (offers === null) {
    return <p className="text-muted">Ladataan…</p>;
  }

  if (offers.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <h2 className="text-lg font-medium">Ei tallennettuja tarjouksia</h2>
          <p className="text-muted mt-1">Luo ensimmäinen tarjous laskurilla.</p>
          <div className="mt-6">
            <Link href="/laskuri">
              <Button>Uusi tarjous</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((o) => {
        const totals = calculateTotals(o);
        return (
          <Card key={o.id}>
            <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <div>
                <h3 className="font-medium text-foreground">{o.projectName}</h3>
                <p className="text-sm text-muted">
                  {o.customerName} · {formatDate(o.createdAt)}
                </p>
                <p className="text-base font-semibold text-foreground mt-1 tabular-nums">
                  {formatEuro(totals.total)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/tarjoukset/${o.id}`}>
                  <Button variant="secondary" size="sm">
                    Avaa
                  </Button>
                </Link>
                <Link href={`/laskuri?id=${o.id}`}>
                  <Button variant="ghost" size="sm">
                    Muokkaa
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(o.id, o.projectName)}
                  className="text-error hover:bg-error/10"
                >
                  Poista
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
