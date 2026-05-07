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
                pistettä · {state.data.latest.period}
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
            <p className="text-sm text-muted mt-2">
              Indeksipisteluku — ei euroja. Vertailutaso 2021 = 100, joten
              esim. {formatNumber(state.data.latest.value, 1)} tarkoittaa, että
              uudisrakentamisen kustannukset ovat{" "}
              <strong className="font-medium text-foreground">
                {formatNumber(state.data.latest.value - 100, 1)} %
              </strong>{" "}
              korkeammat kuin vuonna 2021.
            </p>
            <IndexChart series={state.data.series} />
            <p className="text-xs text-muted mt-3">
              Y-akseli: indeksipisteluku · X-akseli: kuukausi · Lähde:{" "}
              <a
                href="https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__rki/statfin_rki_pxt_13g5.px/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent"
              >
                Tilastokeskus, Rakennuskustannusindeksi
              </a>{" "}
              · CC BY 4.0
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function IndexChart({ series }: { series: { period: string; value: number }[] }) {
  if (series.length < 2) return null;

  const values = series.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = rawMax - rawMin || 1;
  // Pad the y-axis a bit so points don't touch edges
  const pad = span * 0.15;
  const yMin = Math.floor((rawMin - pad) * 10) / 10;
  const yMax = Math.ceil((rawMax + pad) * 10) / 10;
  const yRange = yMax - yMin || 1;

  // Chart geometry (viewBox units)
  const W = 600;
  const H = 220;
  const padL = 38;
  const padR = 10;
  const padT = 12;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xAt = (i: number) => padL + (i * chartW) / (series.length - 1);
  const yAt = (v: number) => padT + chartH - ((v - yMin) / yRange) * chartH;

  // Build paths
  const linePath = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.value).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${xAt(series.length - 1).toFixed(1)} ${(padT + chartH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;

  // Y gridlines: 4 ticks
  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (yRange * i) / yTicks);

  // X labels: show first, middle, last only to avoid clutter
  const xLabelIndices =
    series.length <= 4
      ? series.map((_, i) => i)
      : [0, Math.floor(series.length / 2), series.length - 1];

  const last = series[series.length - 1];

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-44 sm:h-52"
        role="img"
        aria-label="Rakennuskustannusindeksin trendi viimeisten kuukausien ajalta"
      >
        {/* Y-axis grid + labels */}
        {ticks.map((t, i) => {
          const y = yAt(t);
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                stroke="#D9DDD6"
                strokeWidth={1}
                strokeDasharray={i === 0 || i === yTicks ? "0" : "3 3"}
              />
              <text
                x={padL - 6}
                y={y + 3}
                fontSize="10"
                fill="#5B6470"
                textAnchor="end"
              >
                {formatNumber(t, 1)}
              </text>
            </g>
          );
        })}

        {/* Area + line */}
        <path d={areaPath} fill="#7FA38A" fillOpacity="0.12" />
        <path
          d={linePath}
          fill="none"
          stroke="#7FA38A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {series.map((p, i) => (
          <circle
            key={i}
            cx={xAt(i)}
            cy={yAt(p.value)}
            r={2.2}
            fill="#FFFFFF"
            stroke="#7FA38A"
            strokeWidth={1.5}
          />
        ))}

        {/* Highlight the most recent point */}
        <circle
          cx={xAt(series.length - 1)}
          cy={yAt(last.value)}
          r={4.5}
          fill="#7FA38A"
        />
        <circle
          cx={xAt(series.length - 1)}
          cy={yAt(last.value)}
          r={4.5}
          fill="none"
          stroke="#7FA38A"
          strokeOpacity={0.25}
          strokeWidth={6}
        />

        {/* X-axis labels */}
        {xLabelIndices.map((i) => (
          <text
            key={i}
            x={xAt(i)}
            y={H - 8}
            fontSize="10"
            fill="#5B6470"
            textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
          >
            {formatPeriod(series[i].period)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function formatPeriod(period: string): string {
  // "2026M03" -> "3/2026"
  const m = period.match(/^(\d{4})M(\d{2})$/);
  if (!m) return period;
  return `${parseInt(m[2], 10)}/${m[1]}`;
}
