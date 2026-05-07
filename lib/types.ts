export type LineItem = {
  id: string;
  description: string;
  area: number; // m²
  pricePerM2: number; // €/m²
};

export type Offer = {
  id: string;
  createdAt: string; // ISO date
  customerName: string;
  projectName: string;
  lines: LineItem[];
  materialsCost: number; // €
  laborHours: number; // h
  hourlyRate: number; // €/h
  marginPercent: number; // %
};

export type OfferTotals = {
  linesTotal: number;
  laborCost: number;
  subtotal: number; // lines + materials + labor
  marginAmount: number;
  netTotal: number; // subtotal + margin
  vatAmount: number;
  total: number; // netTotal + VAT
};
