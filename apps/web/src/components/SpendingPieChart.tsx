type SliceData = {
  label: string;
  amount: number;
  color: string;
};

// Chart geometry
const CX = 230;         // centre x in viewBox
const CY = 175;         // centre y in viewBox
const R = 100;          // outer radius
const INNER_R = 63;     // donut hole radius
const R_DOT = R + 7;    // coloured dot sits just outside the slice
const R_ELBOW = R + 28; // connector knee — where the line bends toward the label
const R_LINE = R + 48;  // where the line ends (small gap before text)
const R_TEXT = R + 55;  // text anchor (just beyond line end)

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
      return { ...s, start, end, mid: (start + end) / 2 };
    });


  return (
    <div className="w-full h-full">
      {/*
       * viewBox is wider than tall so the chart has room for labels on all
       * four sides.  preserveAspectRatio keeps it centred and undistorted.
       */}
      <svg
        viewBox="0 0 460 350"
        className="w-full h-full"
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
          y={CY - 8}
          textAnchor="middle"
          fontSize="7"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="700"
          fill="#888"
          letterSpacing="1.5"
        >
          SPENT
        </text>
        <text
          x={CX}
          y={CY + 9}
          textAnchor="middle"
          fontSize="12"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="700"
          fill="#111008"
        >
          {totalLabel}
        </text>

        {/* ── Callout connectors + labels ── */}
        {arcs.map((a, i) => {
          const labelAngle = a.mid;

          // Three points that form the two-segment connector:
          //   dot  → elbow (bends here from slice direction to label direction)
          //   elbow → lineEnd
          const dotPt   = polarToCartesian(CX, CY, R_DOT,   a.mid);
          const elbowPt = polarToCartesian(CX, CY, R_ELBOW, labelAngle);
          const linePt  = polarToCartesian(CX, CY, R_LINE,  labelAngle);
          const textPt  = polarToCartesian(CX, CY, R_TEXT,  labelAngle);

          // Text anchor and vertical offset derived from where on the circle
          // the label lands.
          const labelRad = ((labelAngle - 90) * Math.PI) / 180;
          const cosL = Math.cos(labelRad); // > 0 → right side
          const sinL = Math.sin(labelRad); // < 0 → top area

          const textAnchor =
            Math.abs(cosL) < 0.3 ? "middle" : cosL > 0 ? "start" : "end";

          // For labels near the top, draw text above the anchor point;
          // everywhere else, draw it below / beside.
          const textY1 = sinL < -0.3 ? textPt.y - 5 : textPt.y + 2;
          const textY2 = textY1 + 11;

          return (
            <g key={`callout-${i}`}>
              {/* Two-segment elbow connector */}
              <polyline
                points={[
                  `${dotPt.x.toFixed(1)},${dotPt.y.toFixed(1)}`,
                  `${elbowPt.x.toFixed(1)},${elbowPt.y.toFixed(1)}`,
                  `${linePt.x.toFixed(1)},${linePt.y.toFixed(1)}`,
                ].join(" ")}
                fill="none"
                stroke="#bbb"
                strokeWidth="1"
                strokeDasharray="3 2"
                strokeLinejoin="round"
              />
              {/* Coloured dot on the slice edge */}
              <circle
                cx={dotPt.x.toFixed(1)}
                cy={dotPt.y.toFixed(1)}
                r="2.5"
                fill={a.color}
                stroke="#111008"
                strokeWidth="1"
              />
              {/* Category name */}
              <text
                x={textPt.x.toFixed(1)}
                y={textY1.toFixed(1)}
                textAnchor={textAnchor}
                fontSize="7.5"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="700"
                fill="#111008"
              >
                {a.label}
              </text>
              {/* Amount */}
              <text
                x={textPt.x.toFixed(1)}
                y={textY2.toFixed(1)}
                textAnchor={textAnchor}
                fontSize="7"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="400"
                fill="#666"
              >
                ₪{a.amount.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
