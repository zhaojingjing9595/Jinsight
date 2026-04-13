export type SliceData = {
  label: string;
  amount: number;
  color: string;
};

// Chart geometry — viewBox is a tight square around the donut
const CX = 120;         // centre x in viewBox
const CY = 120;         // centre y in viewBox
const R = 100;          // outer radius
const INNER_R = 63;     // donut hole radius

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function donutSlicePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const p1 = polarToCartesian(cx, cy, outerR, startDeg);
  const p2 = polarToCartesian(cx, cy, outerR, endDeg);
  const p3 = polarToCartesian(cx, cy, innerR, endDeg);
  const p4 = polarToCartesian(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export function SpendingPieChart({
  slices,
  totalLabel,
}: {
  slices: SliceData[];
  totalLabel: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  // Build arc data (clockwise, sorted by amount desc as passed in)
  let cursor = 0;
  const arcs = slices
    .filter((s) => s.amount > 0)
    .map((s) => {
      const sweep = (s.amount / total) * 360;
      const start = cursor;
      const end = cursor + sweep;
      cursor += sweep;
      return { ...s, start, end };
    });


  return (
    <div className="w-full h-full flex flex-col">
      {/*
       * viewBox is wider than tall so the chart has room for labels on all
       * four sides.  preserveAspectRatio keeps it centred and undistorted.
       */}
      <svg
        viewBox="0 0 240 240"
        className="flex-1 min-h-0 w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Spending breakdown by category"
      >
        {/* ── Donut slices ── */}
        {arcs.map((a, i) => (
          <path
            key={i}
            d={donutSlicePath(CX, CY, R, INNER_R, a.start, a.end)}
            fill={a.color}
            stroke="#111008"
            strokeWidth="2"
          />
        ))}

        {/* ── Inner hole ── */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_R - 2}
          fill="#fcfaeb"
          stroke="#111008"
          strokeWidth="2"
        />

        {/* ── Centre labels ── */}
        <text
          x={CX}
          y={CY - 10}
          textAnchor="middle"
          fontSize="9"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="700"
          fill="#888"
          letterSpacing="1.5"
        >
          SPENT
        </text>
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fontSize="12"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="700"
          fill="#111008"
        >
          {totalLabel}
        </text>

      </svg>

      {/* ── Bottom legend ── */}
      <div className="flex-none flex flex-wrap justify-center gap-x-3 gap-y-1 pb-1">
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm border border-[#111008] flex-shrink-0"
              style={{ backgroundColor: a.color }}
            />
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                color: "#111008",
              }}
            >
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
