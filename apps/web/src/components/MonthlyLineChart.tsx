export type MonthData = {
  month: string;
  income: number;
  spent: number;
};

const W = 320;
const H = 160;
const LEFT = 40;
const BOTTOM = 22;
const TOP = 22;
const RIGHT = 10;
const CHART_W = W - LEFT - RIGHT;
const CHART_H = H - TOP - BOTTOM;

function fmtK(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;
}

export function MonthlyLineChart({
  months,
  selectedIdx,
}: {
  months: MonthData[];
  selectedIdx?: number;
}) {
  const safeMonths = months.length > 0 ? months : [{ month: "—", income: 0, spent: 0 }];
  const values = safeMonths.flatMap((m) => [m.income, m.spent]);
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const ceiling = Math.max(1000, Math.ceil(maxVal / 1000) * 1000);

  const n = safeMonths.length;
  const xStep = n > 1 ? CHART_W / (n - 1) : CHART_W;

  const toX = (i: number) => LEFT + (n > 1 ? i * xStep : CHART_W / 2);
  const toY = (val: number) => TOP + CHART_H - (val / ceiling) * CHART_H;

  const yTicks = [0, 0.33, 0.67, 1.0].map((t) => ({
    val: Math.round(ceiling * t),
    y: TOP + CHART_H * (1 - t),
  }));

  const incomePoints = safeMonths.map((m, i) => ({ x: toX(i), y: toY(m.income) }));
  const spentPoints = safeMonths.map((m, i) => ({ x: toX(i), y: toY(m.spent) }));

  const toPolyline = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(" ");

  const sel = selectedIdx ?? n - 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="12-month income vs spending line chart"
    >
      {/* Legend */}
      <g transform={`translate(${LEFT + 2}, 5)`}>
        <rect width="8" height="8" rx="2" fill="#2ad2a3" opacity="0.9" stroke="#111008" strokeWidth="1" />
        <text x="11" y="7.5" fontSize="7" fontFamily="Space Grotesk, sans-serif" fill="#111008" fontWeight="700">
          Income
        </text>
        <rect x="50" width="8" height="8" rx="2" fill="#fc524f" opacity="0.75" stroke="#111008" strokeWidth="1" />
        <text x="61" y="7.5" fontSize="7" fontFamily="Space Grotesk, sans-serif" fill="#111008" fontWeight="700">
          Spent
        </text>
      </g>

      {/* Y-axis grid lines + labels */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={LEFT} x2={LEFT + CHART_W}
            y1={t.y} y2={t.y}
            stroke="#111008"
            strokeWidth={i === 0 ? 1.5 : 0.5}
            strokeDasharray={i === 0 ? "0" : "4,3"}
            opacity={i === 0 ? 0.9 : 0.2}
          />
          <text
            x={LEFT - 4} y={t.y + 3}
            textAnchor="end" fontSize="6.5"
            fontFamily="Space Grotesk, sans-serif"
            fill="#555" fontWeight="600"
          >
            {fmtK(t.val)}
          </text>
        </g>
      ))}

      {/* Selected month vertical guide */}
      {n > 0 && (
        <line
          x1={toX(sel)} x2={toX(sel)}
          y1={TOP} y2={TOP + CHART_H}
          stroke="#a57dee"
          strokeWidth="1.5"
          strokeDasharray="3,3"
          opacity="0.7"
        />
      )}

      {/* Income line */}
      <polyline
        points={toPolyline(incomePoints)}
        fill="none"
        stroke="#2ad2a3"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Spent line */}
      <polyline
        points={toPolyline(spentPoints)}
        fill="none"
        stroke="#fc524f"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Dots + month labels */}
      {safeMonths.map((m, i) => {
        const isSel = i === sel;
        return (
          <g key={i}>
            {/* Income dot */}
            <circle
              cx={incomePoints[i].x} cy={incomePoints[i].y}
              r={isSel ? 4 : 2.5}
              fill={isSel ? "#2ad2a3" : "#fff"}
              stroke="#2ad2a3"
              strokeWidth={isSel ? 2 : 1.5}
            />
            {/* Spent dot */}
            <circle
              cx={spentPoints[i].x} cy={spentPoints[i].y}
              r={isSel ? 4 : 2.5}
              fill={isSel ? "#fc524f" : "#fff"}
              stroke="#fc524f"
              strokeWidth={isSel ? 2 : 1.5}
            />
            {/* X-axis label — show every other month when ≥10 months */}
            {(n < 10 || i % 2 === 0 || i === n - 1) && (
              <text
                x={toX(i)} y={H - 5}
                textAnchor="middle" fontSize="6.5"
                fontFamily="Space Grotesk, sans-serif"
                fill={isSel ? "#a57dee" : "#111008"}
                fontWeight={isSel ? "800" : "600"}
              >
                {m.month}
              </text>
            )}
          </g>
        );
      })}

      {/* Y-axis line */}
      <line
        x1={LEFT} x2={LEFT}
        y1={TOP} y2={TOP + CHART_H}
        stroke="#111008" strokeWidth="1.5"
      />
    </svg>
  );
}
