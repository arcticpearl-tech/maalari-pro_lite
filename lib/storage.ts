import type { Offer } from "./types";

const KEY = "maalaripro-lite:offers";
const SEEDED_KEY = "maalaripro-lite:seeded";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getOffers(): Offer[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Offer[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function getOffer(id: string): Offer | undefined {
  return getOffers().find((o) => o.id === id);
}

export function saveOffers(offers: Offer[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(offers));
}

export function upsertOffer(offer: Offer): void {
  const offers = getOffers();
  const idx = offers.findIndex((o) => o.id === offer.id);
  if (idx >= 0) {
    offers[idx] = offer;
  } else {
    offers.unshift(offer);
  }
  saveOffers(offers);
}

export function deleteOffer(id: string): void {
  saveOffers(getOffers().filter((o) => o.id !== id));
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Seed two example offers on first visit so the app feels alive when reviewed.
 * Never overwrites existing user data — only runs if the seed flag is missing.
 */
export function seedDemoOffersIfNeeded(): void {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(SEEDED_KEY)) return;

  const existing = getOffers();
  if (existing.length === 0) {
    const now = new Date();
    const earlier = new Date(now);
    earlier.setDate(earlier.getDate() - 7);

    const demo: Offer[] = [
      {
        id: generateId(),
        createdAt: now.toISOString(),
        customerName: "Anna Korhonen",
        projectName: "Olohuoneen ja keittiön maalaus",
        lines: [
          { id: generateId(), description: "Olohuoneen seinät", area: 48, pricePerM2: 12 },
          { id: generateId(), description: "Keittiön seinät", area: 22, pricePerM2: 14 },
          { id: generateId(), description: "Katot", area: 35, pricePerM2: 10 },
        ],
        materialsCost: 180,
        laborHours: 14,
        hourlyRate: 45,
        marginPercent: 15,
      },
      {
        id: generateId(),
        createdAt: earlier.toISOString(),
        customerName: "Mikko Virtanen",
        projectName: "Toimistotilan ulkomaalaus",
        lines: [
          { id: generateId(), description: "Julkisivu pohjoinen", area: 85, pricePerM2: 18 },
          { id: generateId(), description: "Julkisivu etelä", area: 92, pricePerM2: 18 },
        ],
        materialsCost: 540,
        laborHours: 32,
        hourlyRate: 48,
        marginPercent: 12,
      },
    ];
    saveOffers(demo);
  }

  window.localStorage.setItem(SEEDED_KEY, "1");
}
