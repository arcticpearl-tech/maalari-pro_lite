import type { LineItem, Offer, OfferTotals } from "./types";

export const VAT_RATE = 0.255; // Suomen yleinen ALV-kanta 2026

export function lineSubtotal(line: LineItem): number {
  return (line.area || 0) * (line.pricePerM2 || 0);
}

export function calculateTotals(offer: Offer): OfferTotals {
  const linesTotal = offer.lines.reduce((sum, l) => sum + lineSubtotal(l), 0);
  const laborCost = (offer.laborHours || 0) * (offer.hourlyRate || 0);
  const subtotal = linesTotal + (offer.materialsCost || 0) + laborCost;
  const marginAmount = subtotal * ((offer.marginPercent || 0) / 100);
  const netTotal = subtotal + marginAmount;
  const vatAmount = netTotal * VAT_RATE;
  const total = netTotal + vatAmount;
  return { linesTotal, laborCost, subtotal, marginAmount, netTotal, vatAmount, total };
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat("fi-FI", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fi-FI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
