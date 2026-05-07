"use client";

import { useEffect, useState } from "react";
import { fetchCostIndex, type CostIndexResult } from "@/lib/stat-fi";
import { formatNumber } from "@/lib/pricing";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

type State =
  | { status: "loading" }
  | { status: "ok"; data: CostIndexResult }
  | { status: "error"; message: string };

export function CostIndexWidget() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchCostIndex(ctrl.signal)
      .then((data) => setState({ status: "ok", data }))
      .catch((err: unknown) => {
        if ((err as Error)?.name === "AbortError") return;
        setState({
          status: "error",
          message: (err as Error)?.message ?? "Datan haku epäonnistui",
        });
      });
    return () => ctrl.abort();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rakennuskustannusindeksi</CardTitle>
        <p className="text-sm text-muted mt-1">
          Avointa dataa Tilastokeskuksesta (2021 = 100)
        </p>
      </CardHeader>
      <CardBody>
        {state.status === "loading" && (
          <p className="text-sm text-muted">Ladataan tietoja…</p>
        )}

        {state.status === "error" && (
          <div className="text-sm">
            <p className="text-error font-medium">Tietojen lataus epäonnistui</p>
            <p className="text-muted mt-1">
              Tarkista internet-yhteys. ({state.message})
            </p>
          </div>
        )}

        {state.status === "ok" && (
          <>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-semibold tracking-tight">
                {formatNumber(state.data.latest.value, 1)}
              </span>
              <span className="text-sm text-muted">
                {state.data.latest.period}
              </span>
              {state.data.yoyChangePercent !== null && (
                <span
                  className={
                    "text-sm font-medium px-2 py-0.5 rounded-md " +
                    (state.data.yoyChangePercent >= 0
                      ? "bg-success/10 text-success"
                      : "bg-info/10 text-info")
                  }
                >
                  {state.data.yoyChangePercent >= 0 ? "+" : ""}
                  {formatNumber(state.data.yoyChangePercent, 1)} % vuodessa
                </span>
              )}
            </div>
            <Sparkline points={state.data.series.map((p) => p.value)} />
            <p className="text-xs text-muted mt-3">
              Lähde:{" "}
              <a
                href="https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__rki/statfin_rki_pxt_142p.px/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent"
              >
                Tilastokeskus, Rakennuskustannusindeksi
              </a>{" "}
              · Lisenssi CC BY 4.0
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 320;
  const h = 60;
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-4 w-full h-16"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={path} fill="none" stroke="#7FA38A" strokeWidth="2" />
    </svg>
  );
}
