import type { Metadata } from "next";
import "./globals.css";

// Google Fonts loaded as <link> to avoid CSS @import ordering issues with Tailwind v4

export const metadata: Metadata = {
  title: "Jinsight — The golden view of your finances",
  description: "Personal finance app combining income & expense tracking, shared accounts, goal saving, and emotionally intelligent insights.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
