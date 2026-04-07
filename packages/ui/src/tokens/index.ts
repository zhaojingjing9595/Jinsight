export const colors = {
  base: "#fcfaeb",
  primary: "#a57dee",
  income: "#2ad2a3",
  reward: "#feb704",
  alert: "#fc524f",
  goal: "#cce972",
  story: "#cdb1e7",
  fun: "#fdb6f0",
  ink: "#111008",

  // Category colors
  cat: {
    food: "#2ad2a3",
    transport: "#f07030",
    savings: "#cce972",
    bills: "#cdb1e7",
    fun: "#fdb6f0",
    shopping: "#feb704",
    health: "#9090cc",
    subscriptions: "#208870",
    restaurants: "#f5a800",
    travel: "#f0c000",
    income: "#2ad2a3",
    other: "#fcfaeb",
  },

  // Vault (not active — available to swap)
  vault: {
    berry: "#c0478a",
    gold: "#f5a800",
    tangerine: "#f07030",
    sunflower: "#f0c000",
    neonYellow: "#e8e800",
    crimson: "#c02818",
    vermillion: "#e04028",
    hotPink: "#f06898",
    blush: "#f8b8cc",
    deepTeal: "#208870",
    jungle: "#28a050",
    periwinkle: "#9090cc",
  },
} as const;

export const shadows = {
  lg: "5px 5px 0 #111008",
  md: "4px 4px 0 #111008",
  sm: "3px 3px 0 #111008",
  dark: "4px 4px 0 #555555",
} as const;

export const radius = {
  card: "14px",
  btn: "8px",
  pill: "20px",
  icon: "8px",
  stat: "12px",
  nav: "16px",
  onboard: "20px",
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
} as const;

export const fonts = {
  display: "'Barlow Condensed', sans-serif",
  body: "'Space Grotesk', sans-serif",
} as const;

export const borders = {
  ink: "2.5px solid #111008",
  btn: "2px solid #111008",
  badge: "1.5px solid #111008",
} as const;
