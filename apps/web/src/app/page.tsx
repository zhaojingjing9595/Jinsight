import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-primary">
      {/* Starburst decoration */}
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        className="mb-6"
        aria-hidden="true"
      >
        <path
          d="M23 0L25.5 18.5L40 8L29.5 21L46 23L29.5 25L40 38L25.5 27.5L23 46L20.5 27.5L6 38L16.5 25L0 23L16.5 21L6 8L20.5 18.5L23 0Z"
          fill="#feb704"
          stroke="#111008"
          strokeWidth="1.5"
        />
      </svg>

      {/* Logo + headline */}
      <h1 className="font-display text-[52px] font-[900] text-white text-center leading-[1.0] mb-3 tracking-tight">
        JINSIGHT
      </h1>

      <p className="font-body text-[12px] text-primary-muted text-center leading-[1.5] max-w-[280px] mb-10">
        The golden view of your finances. Track income, expenses, goals — and finally understand your money.
      </p>

      {/* Illustrated coin stack — inline SVG */}
      <div className="mb-10">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <ellipse cx="50" cy="72" rx="30" ry="10" fill="#feb704" stroke="#111008" strokeWidth="2.5" />
          <rect x="20" y="55" width="60" height="17" rx="4" fill="#feb704" stroke="#111008" strokeWidth="2.5" />
          <ellipse cx="50" cy="55" rx="30" ry="10" fill="#fcfaeb" stroke="#111008" strokeWidth="2.5" />

          <ellipse cx="50" cy="45" rx="30" ry="10" fill="#2ad2a3" stroke="#111008" strokeWidth="2.5" />
          <rect x="20" y="28" width="60" height="17" rx="4" fill="#2ad2a3" stroke="#111008" strokeWidth="2.5" />
          <ellipse cx="50" cy="28" rx="30" ry="10" fill="#fcfaeb" stroke="#111008" strokeWidth="2.5" />

          <ellipse cx="50" cy="18" rx="30" ry="10" fill="#a57dee" stroke="#111008" strokeWidth="2.5" />
          <rect x="20" y="4" width="60" height="14" rx="4" fill="#a57dee" stroke="#111008" strokeWidth="2.5" />
          <ellipse cx="50" cy="4" rx="30" ry="10" fill="#fcfaeb" stroke="#111008" strokeWidth="2.5" />

          {/* ₪ symbol */}
          <text
            x="50"
            y="8"
            textAnchor="middle"
            fontSize="10"
            fontWeight="900"
            fill="#111008"
            fontFamily="Barlow Condensed, sans-serif"
          >
            ₪
          </text>
        </svg>
      </div>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="font-body w-full max-w-[300px] py-3 text-center text-[14px] font-[700] text-ink rounded-btn border-2 border-ink bg-income shadow-neo-sm transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-neo-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-neo-pressed"
      >
        Get Started
      </Link>

      <Link
        href="/dashboard"
        className="font-body mt-4 text-[12px] text-primary-muted underline underline-offset-2"
      >
        I already have an account
      </Link>

      {/* Progress dots */}
      <div className="flex gap-2 mt-10">
        <span className="w-2 h-2 rounded-full bg-ink" />
        <span className="w-2 h-2 rounded-full bg-primary-muted" />
        <span className="w-2 h-2 rounded-full bg-primary-muted" />
      </div>
    </main>
  );
}
