"use client";

import { useEffect, useMemo, useState } from "react";
import type { GoldmCurrentOptionChainDatahcRow } from "@/app/(stock-market-multichart-oi)/types/goldm-current-option-chain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SnapshotRow = {
  datahc: GoldmCurrentOptionChainDatahcRow[];
  atm?: number | null;
  future_price?: number | null;
  spot_price?: number | null;
  snapshot_at: string;
};

type StrikeSeries = {
  key: string;
  label: string;
  strike: number;
  kind: "CE" | "PE";
  color: string;
};

const COLORS = [
  "#ef4444",
  "#3b82f6",
  "#f97316",
  "#10b981",
  "#a855f7",
  "#22c55e",
  "#14b8a6",
  "#ec4899",
];

const INTERVALS = [
  { key: "5m", label: "5 min", minutes: 5 },
  { key: "15m", label: "15 min", minutes: 15 },
  { key: "30m", label: "30 min", minutes: 30 },
  { key: "day", label: "Day", minutes: 24 * 60 },
];

function formatTimeLabel(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString([], {
    month: "short",
    day: "2-digit",
  });
}

function isInGoldmSession(date: Date) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const morningStart = 9 * 60;
  const morningEnd = 17 * 60;
  const eveningStart = 17 * 60;
  const eveningEnd = 23 * 60 + 55;
  const inMorning = minutes >= morningStart && minutes <= morningEnd;
  const inEvening = minutes >= eveningStart && minutes <= eveningEnd;
  return inMorning || inEvening;
}

function buildLine(
  data: number[],
  width: number,
  height: number,
  minY: number,
  maxY: number,
  padding: { left: number; right: number; top: number; bottom: number }
) {
  if (data.length === 0 || maxY <= minY) return "";
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const step = plotWidth / Math.max(data.length - 1, 1);
  return data
    .map((value, index) => {
      const x = padding.left + index * step;
      const t = (value - minY) / (maxY - minY);
      const y = padding.top + (1 - t) * plotHeight;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function MultistrikeOiChart({
  snapshots,
}: {
  snapshots: SnapshotRow[];
}) {
  const [intervalKey, setIntervalKey] = useState("5m");
  const [isSpot, setIsSpot] = useState(true);
  const [isIntraday, setIsIntraday] = useState(false);
  const [daysBack, setDaysBack] = useState(2);
  const [only500, setOnly500] = useState(false);
  const [only10000, setOnly10000] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [latestLabel, setLatestLabel] = useState("");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isIntraday) return;
    if (intervalKey === "5m") setDaysBack(2);
    if (intervalKey === "15m") setDaysBack(3);
    if (intervalKey === "30m") setDaysBack(5);
    if (intervalKey === "day") setDaysBack(20);
  }, [intervalKey, isIntraday]);

  const latestSnapshot = snapshots[snapshots.length - 1];
  useEffect(() => {
    if (!latestSnapshot) return;
    setLatestLabel(new Date(latestSnapshot.snapshot_at).toLocaleString());
  }, [latestSnapshot]);

  const mostActive = useMemo(() => {
    const rows = latestSnapshot?.datahc ?? [];
    const ranked = [...rows].sort((a, b) => {
      const aMax = Math.max(a[1], a[2]);
      const bMax = Math.max(b[1], b[2]);
      return bMax - aMax;
    });
    return ranked.slice(0, 6).map((row) => row[0]);
  }, [latestSnapshot]);

  const allSeries = useMemo<StrikeSeries[]>(() => {
    const strikes = latestSnapshot?.datahc.map((row) => row[0]) ?? [];
    const unique = Array.from(new Set(strikes)).sort((a, b) => a - b);
    const filtered = unique.filter((strike) => {
      if (only10000) return strike % 10000 === 0;
      if (only500) return strike % 500 === 0;
      return true;
    });
    return filtered.flatMap((strike, index) => [
      {
        key: `${strike}-CE`,
        label: `${strike} CE`,
        strike,
        kind: "CE",
        color: COLORS[index % COLORS.length],
      },
      {
        key: `${strike}-PE`,
        label: `${strike} PE`,
        strike,
        kind: "PE",
        color: COLORS[(index + 3) % COLORS.length],
      },
    ]);
  }, [latestSnapshot, only500, only10000]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (allSeries.length === 0) return;
    setSelectedKeys(
      allSeries
        .filter((s) => mostActive.includes(s.strike))
        .slice(0, 6)
        .map((s) => s.key)
    );
  }, [allSeries, mostActive]);

  const visibleSeries = useMemo(() => {
    const term = filterText.trim().toLowerCase();
    if (!term) return allSeries;
    return allSeries.filter((series) =>
      series.label.toLowerCase().includes(term)
    );
  }, [allSeries, filterText]);

  const filteredSnapshots = useMemo(() => {
    const interval = INTERVALS.find((i) => i.key === intervalKey);
    if (!interval) return snapshots;
    if (snapshots.length === 0) return [];
    const latestTs = new Date(
      snapshots[snapshots.length - 1].snapshot_at
    );
    const todayIso = latestTs.toISOString().slice(0, 10);
    const minTime = latestTs.getTime() - daysBack * 24 * 60 * 60 * 1000;
    const recent = snapshots.filter((s) => {
      const ts = new Date(s.snapshot_at);
      const isToday = ts.toISOString().slice(0, 10) === todayIso;
      const isRecent = ts.getTime() >= minTime;
      const inSession = isInGoldmSession(ts);
      return inSession && (isIntraday ? isToday : isRecent);
    });
    const bucketMs = interval.minutes * 60 * 1000;
    const byBucket = new Map<number, SnapshotRow>();
    for (const snap of recent) {
      const ts = new Date(snap.snapshot_at).getTime();
      const bucket = Math.floor(ts / bucketMs) * bucketMs;
      const prev = byBucket.get(bucket);
      if (!prev || ts > new Date(prev.snapshot_at).getTime()) {
        byBucket.set(bucket, snap);
      }
    }
    return Array.from(byBucket.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, snap]) => snap);
  }, [snapshots, intervalKey, isIntraday, daysBack]);

  const selectedSeries = useMemo(() => {
    return allSeries.filter((series) => selectedKeys.includes(series.key));
  }, [allSeries, selectedKeys]);

  const seriesData = useMemo(() => {
    return selectedSeries.map((series) => {
      const data = filteredSnapshots.map((snap) => {
        const row = snap.datahc.find((r) => r[0] === series.strike);
        if (!row) return 0;
        return series.kind === "CE" ? row[1] : row[2];
      });
      return { series, data };
    });
  }, [filteredSnapshots, selectedSeries]);

  const spotSeries = useMemo(() => {
    return filteredSnapshots.map(
      (snap) => Number(snap.spot_price ?? snap.atm ?? 0) || 0
    );
  }, [filteredSnapshots]);

  const futureSeries = useMemo(() => {
    return filteredSnapshots.map(
      (snap) => Number(snap.future_price ?? 0) || 0
    );
  }, [filteredSnapshots]);

  const maxOi = Math.max(
    1,
    ...seriesData.flatMap((s) => s.data.map((v) => Number(v) || 0))
  );
  const minOi = 0;

  const priceValues = [...spotSeries, ...futureSeries].filter((v) => v > 0);
  const priceMin = priceValues.length ? Math.min(...priceValues) : 0;
  const priceMax = priceValues.length ? Math.max(...priceValues) : 1;

  const width = 980;
  const height = 420;
  const padding = { left: 52, right: 52, top: 12, bottom: 30 };
  const yTicks = 5;
  const oiTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(minOi + (maxOi - minOi) * (i / yTicks))
  );
  const priceTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(priceMin + (priceMax - priceMin) * (i / yTicks))
  );
  const xTicks = filteredSnapshots.filter(
    (_, idx) =>
      idx % Math.max(Math.floor(filteredSnapshots.length / 4), 1) === 0
  );
  const xLabels = xTicks.map((snap) =>
    formatTimeLabel(new Date(snap.snapshot_at))
  );
  const xDateLabels = xTicks.map((snap) =>
    formatDateLabel(new Date(snap.snapshot_at))
  );

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const step = plotWidth / Math.max(filteredSnapshots.length - 1, 1);
  const resolvedHoverIndex =
    hoverIndex !== null
      ? clamp(hoverIndex, 0, Math.max(filteredSnapshots.length - 1, 0))
      : null;
  const hoverSnapshot =
    resolvedHoverIndex !== null ? filteredSnapshots[resolvedHoverIndex] : null;
  const hoverX =
    resolvedHoverIndex !== null ? padding.left + resolvedHoverIndex * step : 0;

  if (!latestSnapshot) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-slate-500">
        Waiting for data...
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="gap-3">
          <div className="text-xs font-semibold text-slate-600">Filters</div>
          <div className="flex items-center gap-2">
            <Input
              defaultValue="GOLDM"
              className="h-8 text-xs"
              aria-label="Symbol"
            />
          </div>
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search strike (e.g. 165000)"
            className="h-8 text-xs"
          />
        </CardHeader>
        <CardContent>
          <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={only500}
                onChange={(e) => {
                  setOnly500(e.target.checked);
                  if (e.target.checked) setOnly10000(false);
                }}
              />
              Only x500
            </Label>
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={only10000}
                onChange={(e) => {
                  setOnly10000(e.target.checked);
                  if (e.target.checked) setOnly500(false);
                }}
              />
              Only x10000
            </Label>
          </div>
          <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Selected: {selectedKeys.length}/{allSeries.length}
            </span>
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedKeys.length === allSeries.length}
                onChange={(e) =>
                  setSelectedKeys(
                    e.target.checked ? allSeries.map((s) => s.key) : []
                  )
                }
              />
              Select All
            </Label>
          </div>
          <div className="max-h-[360px] space-y-1.5 overflow-y-auto pr-1 text-xs">
            {visibleSeries.map((series) => (
              <Label
                key={series.key}
                className="flex items-center gap-2 rounded-md px-1.5 py-1 text-slate-600 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(series.key)}
                  onChange={(e) => {
                    setSelectedKeys((prev) =>
                      e.target.checked
                        ? [...prev, series.key]
                        : prev.filter((k) => k !== series.key)
                    );
                  }}
                />
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                <span className="font-mono text-[11px]">
                  {series.strike}
                </span>
                <span className="text-[11px] text-slate-500">
                  {series.kind}
                </span>
              </Label>
            ))}
            {visibleSeries.length === 0 && (
              <div className="rounded-md border border-dashed p-2 text-[11px] text-slate-500">
                No strikes match your search.
              </div>
            )}
          </div>
          <div className="mt-4 rounded-lg border border-dashed p-3 text-[11px] text-slate-500">
            OI data is refreshed every 2 minutes.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Multi Strike OI</CardTitle>
              <div className="text-xs text-slate-400">GOLDM</div>
            </div>
            <div className="text-xs text-slate-500" suppressHydrationWarning>
              Latest: {latestLabel}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border bg-slate-50 p-1">
              {INTERVALS.map((interval) => (
                <Button
                  key={interval.key}
                  variant={intervalKey === interval.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setIntervalKey(interval.key);
                    if (interval.key === "day") setIsIntraday(false);
                  }}
                  className="h-7 px-3 text-xs"
                >
                  {interval.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-slate-50 p-1">
              <Button
                variant={isSpot ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsSpot(true)}
                className="h-7 px-3 text-xs"
              >
                Spot
              </Button>
              <Button
                variant={!isSpot ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsSpot(false)}
                className="h-7 px-3 text-xs"
              >
                Future
              </Button>
            </div>
            <Label className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={isIntraday}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsIntraday(checked);
                  if (checked && intervalKey === "day") {
                    setIntervalKey("5m");
                  }
                }}
              />
              Intraday
            </Label>
          </div>
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <span>Days:</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setDaysBack((d) => Math.max(1, d - 1))}
              disabled={isIntraday}
            >
              -
            </Button>
            <span className="w-6 text-center">{daysBack}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setDaysBack((d) => Math.min(30, d + 1))}
              disabled={isIntraday}
            >
              +
            </Button>
            {isIntraday && (
              <span className="text-[11px] text-slate-400">
                (intraday only)
              </span>
            )}
          </div>

          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-[26rem] w-full"
              role="img"
              aria-label="Open interest lines"
              onMouseLeave={() => setHoverIndex(null)}
              onMouseMove={(event) => {
                if (filteredSnapshots.length === 0) return;
                const svg = event.currentTarget as SVGSVGElement;
                const pt = svg.createSVGPoint();
                pt.x = event.clientX;
                pt.y = event.clientY;
                const ctm = svg.getScreenCTM();
                if (!ctm) return;
                const cursor = pt.matrixTransform(ctm.inverse());
                const clamped = clamp(
                  cursor.x,
                  padding.left,
                  width - padding.right
                );
                const idx = Math.round((clamped - padding.left) / step);
                setHoverIndex(idx);
              }}
            >
              <rect width={width} height={height} fill="white" />
              {oiTickValues.map((_, i) => {
                const t = i / yTicks;
                const y =
                  padding.top +
                  (1 - t) * (height - padding.top - padding.bottom);
                return (
                  <line
                    key={`grid-${i}`}
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={y}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                  />
                );
              })}
              {seriesData.map(({ series, data }) => (
                <polyline
                  key={series.key}
                  points={buildLine(data, width, height, minOi, maxOi, padding)}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="2"
                />
              ))}
              {spotSeries.some((v) => v > 0) && (
                <polyline
                  points={buildLine(
                    spotSeries,
                    width,
                    height,
                    priceMin,
                    priceMax,
                    padding
                  )}
                  fill="none"
                  stroke="#111827"
                  strokeWidth="2"
                />
              )}
              {futureSeries.some((v) => v > 0) && (
                <polyline
                  points={buildLine(
                    futureSeries,
                    width,
                    height,
                    priceMin,
                    priceMax,
                    padding
                  )}
                  fill="none"
                  stroke="#111827"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}
              <line
                x1={padding.left}
                x2={padding.left}
                y1={padding.top}
                y2={height - padding.bottom}
                stroke="#cbd5f5"
              />
              <line
                x1={width - padding.right}
                x2={width - padding.right}
                y1={padding.top}
                y2={height - padding.bottom}
                stroke="#cbd5f5"
              />
              {priceTickValues.map((value, i) => {
                const t = i / yTicks;
                const y =
                  padding.top +
                  (1 - t) * (height - padding.top - padding.bottom);
                return (
                  <text
                    key={`price-${i}`}
                    x={padding.left - 8}
                    y={y + 3}
                    fontSize="10"
                    fill="#6b7280"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                );
              })}
              {oiTickValues.map((value, i) => {
                const t = i / yTicks;
                const y =
                  padding.top +
                  (1 - t) * (height - padding.top - padding.bottom);
                return (
                  <text
                    key={`oi-${i}`}
                    x={width - padding.right + 8}
                    y={y + 3}
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {value}
                  </text>
                );
              })}
              {resolvedHoverIndex !== null && (
                <line
                  x1={hoverX}
                  x2={hoverX}
                  y1={padding.top}
                  y2={height - padding.bottom}
                  stroke="#94a3b8"
                  strokeDasharray="3 4"
                />
              )}
            </svg>
            {hoverSnapshot && (
              <div
                className="absolute top-3 rounded-md border bg-white/95 p-2 text-[11px] shadow-sm"
                style={{
                  left: `min(max(${hoverX}px + 10px, 8px), calc(100% - 180px))`,
                }}
              >
                <div className="mb-1 text-[10px] text-slate-500">
                  {new Date(hoverSnapshot.snapshot_at).toLocaleString()}
                </div>
                {spotSeries.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-black" />
                    <span>Spot: {hoverSnapshot.spot_price ?? hoverSnapshot.atm}</span>
                  </div>
                )}
                {futureSeries.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-black" />
                    <span>Future: {hoverSnapshot.future_price}</span>
                  </div>
                )}
                {seriesData.map(({ series }) => {
                  const row = hoverSnapshot.datahc.find(
                    (r) => r[0] === series.strike
                  );
                  const value = row ? (series.kind === "CE" ? row[1] : row[2]) : 0;
                  return (
                    <div key={series.key} className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: series.color }}
                      />
                      <span>
                        {series.label}: {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              {xLabels.map((label, idx) => (
                <span key={`${label}-${idx}`}>{label}</span>
              ))}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300">
              {xDateLabels.map((label, idx) => (
                <span key={`${label}-${idx}`}>{label}</span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
