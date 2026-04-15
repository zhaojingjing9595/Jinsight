export type MonthData = {
  month: string; // e.g. "Nov", "Dec"
  income: number;
  spent: number;
};

// SVG canvas dimensions
const W = 300;
const H = 170;
const LEFT = 38;   // space for Y-axis labels
const BOTTOM = 24; // space for X-axis labels
const TOP = 18;    // space for legend
const RIGHT = 8;
const CHART_W = W - LEFT - RIGHT;
const CHART_H = H - TOP - BOTTOM;

function fmtK(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;
}

export function MonthlyBarChart({ months }: { months: MonthData[] }) {
  const safeMonths = months.length > 0 ? months : [{ month: "—", income: 0, spent: 0 }];
  const values = safeMonths.flatMap((m) => [m.income, m.spent]);
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  // Round up to a nice ceiling so bars never touch the top — never fall below 1000
  const ceiling = Math.max(1000, Math.ceil(maxVal / 1000) * 1000);

  const groupW = CHART_W / safeMonths.length;
  const barW = groupW * 0.58;
  const barOffsetX = (groupW - barW) / 2;

  const toBarH = (val: number) => (val / ceiling) * CHART_H;
  const toBarY = (val: number) => TOP + CHART_H - toBarH(val);

  // 4 Y-axis grid lines (0 %, 33 %, 67 %, 100 %)
  const yTicks = [0, 0.33, 0.67, 1.0].map((t) => ({
    val: Math.round(ceiling * t),
    y: TOP + CHART_H * (1 - t),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="6-month income vs spending bar chart"
    >
      {/* ── Legend ── */}
      <g transform={`translate(${LEFT + 2}, 4)`}>
        <rect width="8" height="8" rx="2" fill="#2ad2a3" opacity="0.85" stroke="#111008" strokeWidth="1" />
        <text x="11" y="7.5" fontSize="7" fontFamily="Space Grotesk, sans-serif" fill="#111008" fontWeight="700">
          Income
        </text>
        <rect x="50" width="8" height="8" rx="2" fill="#fc524f" opacity="0.65" stroke="#111008" strokeWidth="1" />
        <text x="61" y="7.5" fontSize="7" fontFamily="Space Grotesk, sans-serif" fill="#111008" fontWeight="700">
          Spent
        </text>
      </g>

      {/* ── Y-axis grid lines + labels ── */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={LEFT} x2={LEFT + CHART_W}
            y1={t.y} y2={t.y}
            stroke="#111008"
            strokeWidth={i === 0 ? 1.5 : 0.5}
            strokeDasharray={i === 0 ? "0" : "4,3"}
            opacity={i === 0 ? 0.9 : 0.22}
          />
          <text
            x={LEFT - 4} y={t.y + 3}
            textAnchor="end" fontSize="7"
            fontFamily="Space Grotesk, sans-serif"
            fill="#555" fontWeight="600"
          >
            {fmtK(t.val)}
          </text>
        </g>
      ))}

      {/* ── Bars ── */}
      {safeMonths.map((m, i) => {
        const overspent = m.spent > m.income;
        // When overspending: both bars are more transparent
        const incomeOpacity = overspent ? 0.52 : 0.85;
        const spentOpacity = overspent ? 0.50 : 0.70;

        const x = LEFT + i * groupW + barOffsetX;

        const incomeH = toBarH(m.income);
        const spentH = toBarH(m.spent);
        const incomeY = toBarY(m.income);
        const spentY = toBarY(m.spent);

        return (
          <g key={i}>
            {/* Income bar (green, rendered first = behind) */}
            <rect
              x={x} y={incomeY}
              width={barW} height={incomeH}
              fill="#2ad2a3"
              opacity={incomeOpacity}
              rx="3"
              stroke="#111008" strokeWidth="1.5"
            />
            {/* Spent bar (red, rendered on top, fills from bottom) */}
            <rect
              x={x} y={spentY}
              width={barW} height={spentH}
              fill="#fc524f"
              opacity={spentOpacity}
              rx="3"
              stroke="#111008" strokeWidth="1.5"
            />
            {/* Month label */}
            <text
              x={x + barW / 2} y={H - 7}
              textAnchor="middle" fontSize="8"
              fontFamily="Space Grotesk, sans-serif"
              fill="#111008" fontWeight="700"
            >
              {m.month}
            </text>
          </g>
        );
      })}

      {/* ── Y-axis line ── */}
      <line
        x1={LEFT} x2={LEFT}
        y1={TOP} y2={TOP + CHART_H}
        stroke="#111008" strokeWidth="1.5"
      />
    </svg>
  );
}
