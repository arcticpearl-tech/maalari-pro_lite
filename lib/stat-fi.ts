/**
 * Tilastokeskus PxWeb — Rakennuskustannusindeksi (2021=100)
 * Public open data, no API key required.
 * License: CC BY 4.0 (Tilastokeskus)
 *
 * Data source:
 *   https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__rki/statfin_rki_pxt_142p.px/
 */

const PX_URL =
  "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/rki/statfin_rki_pxt_142p.px";

export type CostIndexPoint = {
  period: string; // e.g. "2026M03"
  value: number;
};

export type CostIndexResult = {
  latest: CostIndexPoint;
  yearAgo: CostIndexPoint | null;
  yoyChangePercent: number | null;
  series: CostIndexPoint[];
};

type PxResponse = {
  dimension: Record<string, { category: { index: Record<string, number>; label: Record<string, string> } }>;
  id: string[];
  size: number[];
  value: (number | null)[];
};

/**
 * Fetches the last ~14 monthly observations of the total construction cost index.
 * Query asks for the most recent values via the "Top" selection.
 */
export async function fetchCostIndex(signal?: AbortSignal): Promise<CostIndexResult> {
  const body = {
    query: [
      {
        code: "Kuukausi",
        selection: { filter: "top", values: ["14"] },
      },
      {
        code: "Tiedot",
        selection: { filter: "item", values: ["indeksi"] },
      },
      {
        code: "Talotyyppi",
        selection: { filter: "item", values: ["0 Kokonaisindeksi"] },
      },
    ],
    response: { format: "json-stat2" },
  };

  const res = await fetch(PX_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Tilastokeskus API virhe: ${res.status}`);
  }

  const data = (await res.json()) as PxResponse;
  return parsePxResponse(data);
}

function parsePxResponse(data: PxResponse): CostIndexResult {
  // Find the time dimension (Kuukausi)
  const timeDim = data.dimension["Kuukausi"];
  if (!timeDim) throw new Error("Aikadimensio puuttuu vastauksesta");

  const periods = Object.keys(timeDim.category.index).sort(
    (a, b) => timeDim.category.index[a] - timeDim.category.index[b]
  );

  const series: CostIndexPoint[] = periods
    .map((p, i) => ({
      period: timeDim.category.label[p] || p,
      value: typeof data.value[i] === "number" ? (data.value[i] as number) : NaN,
    }))
    .filter((pt) => Number.isFinite(pt.value));

  if (series.length === 0) {
    throw new Error("Ei datapisteitä");
  }

  const latest = series[series.length - 1];
  const yearAgo = series.length >= 13 ? series[series.length - 13] : null;
  const yoy =
    yearAgo && yearAgo.value !== 0
      ? ((latest.value - yearAgo.value) / yearAgo.value) * 100
      : null;

  return { latest, yearAgo, yoyChangePercent: yoy, series };
}
