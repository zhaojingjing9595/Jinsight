import type { Category } from "@jinsight/core";

export const CATEGORY_ICON_PATHS: Record<Category, string[]> = {
  // ── Expense ──
  rent: [
    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    "M9 22V12h6v10",
  ],
  utilities: ["M13 2L3 14h9l-1 8 10-12h-9z"],
  subscriptions: [
    "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z",
    "M2 10h20",
    "M6 15h4",
  ],
  grocery: [
    "M6 2H3",
    "M6 2l2 11h10l2-7H7",
    "M10 20a1.5 1.5 0 100 3 1.5 1.5 0 000-3z",
    "M17 20a1.5 1.5 0 100 3 1.5 1.5 0 000-3z",
  ],
  dining: [
    "M3 2v7a3 3 0 006 0V2",
    "M6 9v13",
    "M18 2v20",
    "M18 2c-2 0-4 2-4 5s2 5 4 5",
  ],
  shopping: [
    "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z",
    "M3 6h18",
    "M16 10a4 4 0 01-8 0",
  ],
  entertainment: [
    "M9 18V5l12-2v13",
    "M6 21a3 3 0 100-6 3 3 0 000 6z",
    "M18 19a3 3 0 100-6 3 3 0 000 6z",
  ],
  transport: [
    "M8 4h8a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z",
    "M6 12h12",
    "M10 18v2",
    "M14 18v2",
    "M10 4V2",
    "M14 4V2",
  ],
  education: [
    "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z",
    "M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  ],
  travel: [
    "M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  ],
  other: [
    "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    "M3.27 6.96L12 12.01l8.73-5.05",
    "M12 22.08V12",
  ],

  // ── Income ──
  salary: [
    "M12 1v22",
    "M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  ],
  bonus: ["M20 12l-8-8-8 8", "M4 12l8 8 8-8"],
  freelance: [
    "M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34",
    "M18 2l4 4-10 10H8v-4L18 2z",
  ],
  side_hustle: [
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
    "M12 6v6l4 2",
  ],
  investment_return: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  refund: ["M3 12a9 9 0 109-9", "M3 3v9h9"],
  gift: [
    "M20 12v10H4V12",
    "M2 7h20v5H2z",
    "M12 22V7",
    "M12 7a4 4 0 00-4-4c-1.1 0-2 .9-2 2 0 2 6 2 6 2z",
    "M12 7a4 4 0 014-4c1.1 0 2 .9 2 2 0 2-6 2-6 2z",
  ],
  other_income: [
    "M2 16.1A5 5 0 0115.9 2L22 8.1 8.1 22 2 16.1z",
    "M17.5 6.5l-10 10",
  ],
};

// Generic tag icon shown for user-created custom categories
const CUSTOM_ICON_PATHS = [
  "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z",
  "M7 7h.01",
];

export function CategoryIcon({
  category,
  size = 22,
  strokeWidth = 2,
}: {
  category: string;
  size?: number;
  strokeWidth?: number;
}) {
  const paths = CATEGORY_ICON_PATHS[category as Category] ?? CUSTOM_ICON_PATHS;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="#111008"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
