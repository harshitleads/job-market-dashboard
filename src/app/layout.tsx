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
  title: "Job Market Pulse - US Labor Market Dashboard",
  description:
    "Interactive dashboard visualizing US labor market trends from 2021 to present using Federal Reserve (FRED) data. Track job openings, unemployment, hires, quits, and layoffs.",
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
