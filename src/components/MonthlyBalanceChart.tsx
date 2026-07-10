import { formatYenCompact } from "../core/format";

export interface BalanceChartPoint {
  key: string;
  /** Short axis label, e.g. "7" for July. */
  label: string;
  /** Positive means partner owed the user that month; negative means the reverse. */
  netAmount: number;
}

const HEIGHT = 160;
const BAR_AREA_HEIGHT = 100;
const BASELINE_Y = HEIGHT / 2;

/**
 * Lightweight self-drawn SVG bar chart — no charting library. Mirrors
 * MonthlyBalanceChartView.swift: a single signed bar per month (a 2-person split only ever
 * has one net direction), positive bars rising above the baseline, negative bars dropping
 * below it. Only the most recent 12 months are shown, oldest first.
 */
export function MonthlyBalanceChart({ points }: { points: BalanceChartPoint[] }) {
  const recent = points.slice(-12);
  if (recent.length === 0) return null;

  const maxAbs = Math.max(1, ...recent.map((p) => Math.abs(p.netAmount)));
  const width = Math.max(240, recent.length * 40);
  const barSlot = width / recent.length;
  const barWidth = Math.min(28, barSlot * 0.55);

  return (
    <div className="card">
      <svg viewBox={`0 0 ${width} ${HEIGHT}`} width="100%" height={HEIGHT} role="img" aria-label="月別の精算額推移グラフ">
        <line x1={0} y1={BASELINE_Y} x2={width} y2={BASELINE_Y} stroke="var(--color-border)" strokeWidth={1} />
        {recent.map((point, i) => {
          const x = i * barSlot + (barSlot - barWidth) / 2;
          const magnitude = (Math.abs(point.netAmount) / maxAbs) * (BAR_AREA_HEIGHT / 2);
          const isPositive = point.netAmount > 0;
          const barY = isPositive ? BASELINE_Y - magnitude : BASELINE_Y;
          const barHeight = Math.max(point.netAmount === 0 ? 0 : 2, magnitude);
          const color = point.netAmount === 0 ? "var(--color-text-secondary)" : isPositive ? "var(--color-positive)" : "var(--color-negative)";
          return (
            <g key={point.key}>
              <rect x={x} y={barY} width={barWidth} height={barHeight} rx={4} fill={color} />
              <text x={x + barWidth / 2} y={HEIGHT - 6} textAnchor="middle" fontSize="10" fill="var(--color-text-secondary)">
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="chart-scale-hint">
        {formatYenCompact(maxAbs)}
      </div>
    </div>
  );
}
