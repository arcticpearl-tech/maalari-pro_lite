"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import {
  calculateTotals,
  formatEuro,
  lineSubtotal,
  VAT_RATE,
} from "@/lib/pricing";
import {
  generateId,
  getOffer,
  upsertOffer,
} from "@/lib/storage";
import type { LineItem, Offer } from "@/lib/types";

function emptyOffer(): Offer {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    customerName: "",
    projectName: "",
    lines: [
      { id: generateId(), description: "Seinät", area: 0, pricePerM2: 12 },
    ],
    materialsCost: 0,
    laborHours: 0,
    hourlyRate: 45,
    marginPercent: 15,
  };
}

export function PricingCalculator() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");

  const [offer, setOffer] = useState<Offer>(() => emptyOffer());

  // Load existing offer if editing
  useEffect(() => {
    if (!editId) return;
    const existing = getOffer(editId);
    if (existing) setOffer(existing);
  }, [editId]);

  const totals = useMemo(() => calculateTotals(offer), [offer]);

  function patch(p: Partial<Offer>) {
    setOffer((o) => ({ ...o, ...p }));
  }

  function patchLine(id: string, p: Partial<LineItem>) {
    setOffer((o) => ({
      ...o,
      lines: o.lines.map((l) => (l.id === id ? { ...l, ...p } : l)),
    }));
  }

  function addLine() {
    setOffer((o) => ({
      ...o,
      lines: [
        ...o.lines,
        { id: generateId(), description: "", area: 0, pricePerM2: 12 },
      ],
    }));
  }

  function removeLine(id: string) {
    setOffer((o) => ({
      ...o,
      lines: o.lines.length > 1 ? o.lines.filter((l) => l.id !== id) : o.lines,
    }));
  }

  function save() {
    const toSave: Offer = {
      ...offer,
      createdAt: editId ? offer.createdAt : new Date().toISOString(),
    };
    upsertOffer(toSave);
    router.push("/tarjoukset");
  }

  const isValid = offer.customerName.trim() && offer.projectName.trim();

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{editId ? "Muokkaa tarjousta" : "Uusi tarjous"}</CardTitle>
          </CardHeader>
          <CardBody className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Asiakas</Label>
              <Input
                id="customer"
                value={offer.customerName}
                onChange={(e) => patch({ customerName: e.target.value })}
                placeholder="Esim. Anna Korhonen"
              />
            </div>
            <div>
              <Label htmlFor="project">Kohde</Label>
              <Input
                id="project"
                value={offer.projectName}
                onChange={(e) => patch({ projectName: e.target.value })}
                placeholder="Esim. Olohuoneen maalaus"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maalausrivit</CardTitle>
            <p className="text-sm text-muted mt-1">
              Pinta-ala (m²) × yksikköhinta (€/m²)
            </p>
          </CardHeader>
          <CardBody className="space-y-3">
            {offer.lines.map((line, idx) => (
              <div
                key={line.id}
                className="grid grid-cols-12 gap-2 items-end p-3 rounded-md bg-surface-subtle"
              >
                <div className="col-span-12 sm:col-span-4">
                  {idx === 0 && <Label>Kuvaus</Label>}
                  <Input
                    value={line.description}
                    onChange={(e) =>
                      patchLine(line.id, { description: e.target.value })
                    }
                    placeholder="Seinät, katto…"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  {idx === 0 && <Label>m²</Label>}
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={line.area || ""}
                    onChange={(e) =>
                      patchLine(line.id, { area: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  {idx === 0 && <Label>€/m²</Label>}
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={line.pricePerM2 || ""}
                    onChange={(e) =>
                      patchLine(line.id, {
                        pricePerM2: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 text-right">
                  {idx === 0 && <Label>Yht.</Label>}
                  <div className="h-11 flex items-center justify-end text-sm font-medium tabular-nums whitespace-nowrap">
                    {formatEuro(lineSubtotal(line))}
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-2 flex sm:justify-end">
                  {idx === 0 && <Label className="sm:invisible">&nbsp;</Label>}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(line.id)}
                    aria-label="Poista rivi"
                    disabled={offer.lines.length === 1}
                    className="text-error hover:bg-error/10"
                  >
                    Poista
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addLine}>
              + Lisää rivi
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materiaalit ja työ</CardTitle>
          </CardHeader>
          <CardBody className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="materials">Materiaalit (€)</Label>
              <Input
                id="materials"
                type="number"
                min={0}
                value={offer.materialsCost || ""}
                onChange={(e) =>
                  patch({ materialsCost: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label htmlFor="hours">Työtunnit</Label>
              <Input
                id="hours"
                type="number"
                min={0}
                value={offer.laborHours || ""}
                onChange={(e) =>
                  patch({ laborHours: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label htmlFor="rate">Tuntihinta (€/h)</Label>
              <Input
                id="rate"
                type="number"
                min={0}
                value={offer.hourlyRate || ""}
                onChange={(e) =>
                  patch({ hourlyRate: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="margin">Kate (%)</Label>
              <Input
                id="margin"
                type="number"
                min={0}
                max={100}
                value={offer.marginPercent || ""}
                onChange={(e) =>
                  patch({ marginPercent: Number(e.target.value) || 0 })
                }
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="lg:sticky lg:top-20 self-start">
        <Card>
          <CardHeader>
            <CardTitle>Yhteenveto</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <Row label="Maalausrivit" value={formatEuro(totals.linesTotal)} />
            <Row label="Materiaalit" value={formatEuro(offer.materialsCost)} />
            <Row label="Työ" value={formatEuro(totals.laborCost)} />
            <hr className="border-border my-2" />
            <Row label="Välisumma" value={formatEuro(totals.subtotal)} />
            <Row
              label={`Kate ${offer.marginPercent || 0} %`}
              value={formatEuro(totals.marginAmount)}
            />
            <Row
              label="Veroton hinta"
              value={formatEuro(totals.netTotal)}
              bold
            />
            <Row
              label={`ALV ${(VAT_RATE * 100).toFixed(1).replace(".", ",")} %`}
              value={formatEuro(totals.vatAmount)}
            />
            <hr className="border-border my-2" />
            <Row
              label="Loppusumma"
              value={formatEuro(totals.total)}
              bold
              big
            />
            <div className="pt-4">
              <Button
                onClick={save}
                disabled={!isValid}
                size="lg"
                className="w-full"
              >
                {editId ? "Tallenna muutokset" : "Tallenna tarjous"}
              </Button>
              {!isValid && (
                <p className="text-xs text-muted mt-2 text-center">
                  Täytä asiakas ja kohde tallentaaksesi.
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
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
