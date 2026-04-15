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

const MAX_LABEL_CHARS = 11;

function truncate(text: string): string {
  return text.length > MAX_LABEL_CHARS
    ? text.slice(0, MAX_LABEL_CHARS - 1).trimEnd() + "…"
    : text;
}

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


  // Callout labels for slices larger than5%
  const callouts = arcs
    .filter((a) => a.amount / total > 0.05)
    .map((a) => {
      const midDeg = (a.start + a.end) / 2;
      const p1 = polarToCartesian(CX, CY, R + 2, midDeg);
      const elbow = polarToCartesian(CX, CY, R + 14, midDeg);
      const isRight = elbow.x >= CX;
      const labelX = isRight ? CX + R + 30 : CX - R - 30;
      const labelY = elbow.y;
      const pct = Math.round((a.amount / total) * 100);
      return { a, p1, elbow, labelX, labelY, isRight, pct };
    });

  return (
    <div className="w-full h-full flex flex-col">
      <svg
        viewBox="-110 -10 460 260"
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

        {/* ── Callout labels (slices > 15%) ── */}
        {callouts.map(({ a, p1, elbow, labelX, labelY, isRight, pct }, i) => (
          <g key={`callout-${i}`}>
            <polyline
              points={`${p1.x.toFixed(2)},${p1.y.toFixed(2)} ${elbow.x.toFixed(2)},${elbow.y.toFixed(2)} ${labelX},${labelY}`}
              fill="none"
              stroke="#111008"
              strokeWidth="1"
            />
            <circle cx={p1.x} cy={p1.y} r="1.6" fill="#111008" />
            <rect
              x={isRight ? labelX + 3 : labelX - 12}
              y={labelY - 10}
              width="9"
              height="9"
              rx="2"
              fill={a.color}
              stroke="#111008"
              strokeWidth="1"
            />
            <text
              x={labelX + (isRight ? 15 : -15)}
              y={labelY - 2}
              textAnchor={isRight ? "start" : "end"}
              fontSize="13"
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="700"
              fill="#111008"
            >
              <title>{a.label}</title>
              {truncate(a.label)}
            </text>
            <text
              x={labelX + (isRight ? 15 : -15)}
              y={labelY + 12}
              textAnchor={isRight ? "start" : "end"}
              fontSize="11"
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="600"
              fill="#555"
            >
              {pct}%
            </text>
          </g>
        ))}

        {/* ── Inner hole ── */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_R - 2}
          fill="var(--color-base)"
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

      {/* ── Bottom legend (hidden for now) ── */}
      <div className="hidden flex-none flex-wrap justify-center gap-x-3 gap-y-1 pb-1">
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm border border-ink flex-shrink-0"
              style={{ backgroundColor: a.color }}
            />
            <span className="font-body text-[10px] font-semibold text-ink">
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
