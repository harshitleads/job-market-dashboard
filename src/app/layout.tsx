import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Market Pulse -- H-1B Visa Tracker & US Labor Market Dashboard",
  description:
    "Track H-1B visa sponsors, PM salaries, approval trends, and US labor market indicators. Filter by US, California, or Bay Area. Built with FRED API, DOL, and USCIS data.",
  metadataBase: new URL("https://pulse.harshit.ai"),
  openGraph: {
    title: "Job Market Pulse -- H-1B Visa Tracker & US Labor Market Dashboard",
    description:
      "Track H-1B visa sponsors, PM salaries, approval trends, and US labor market indicators. Filter by US, California, or Bay Area. Built with FRED API, DOL, and USCIS data.",
    url: "https://pulse.harshit.ai",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0f1e] font-sans text-[#e2e8f0]">
        {children}
      </body>
    </html>
  );
}
