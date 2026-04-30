export type SliceData = {
  label: string;
  amount: number;
  color: string;
};

const CX = 60;
const CY = 60;
const R = 52;
const INNER_R = 33;

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
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Spending breakdown by category"
    >
      {arcs.map((a, i) => (
        <path
          key={i}
          d={donutSlicePath(CX, CY, R, INNER_R, a.start, a.end)}
          fill={a.color}
          stroke="#111008"
          strokeWidth="1.5"
        />
      ))}

      <circle
        cx={CX}
        cy={CY}
        r={INNER_R - 1}
        fill="var(--color-base)"
        stroke="#111008"
        strokeWidth="1.5"
      />

      <text
        x={CX}
        y={CY - 7}
        textAnchor="middle"
        fontSize="6"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="700"
        fill="#888"
        letterSpacing="1.2"
      >
        SPENT
      </text>
      <text
        x={CX}
        y={CY + 8}
        textAnchor="middle"
        fontSize="8"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="700"
        fill="#111008"
      >
        {totalLabel}
      </text>
    </svg>
  );
}
