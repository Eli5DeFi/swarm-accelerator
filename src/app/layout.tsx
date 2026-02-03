import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SwarmAccelerator | AI-Powered Startup Accelerator",
  description: "Pitch your startup to an intelligent swarm of AI agents. Get instant analysis, valuation, and connect with top VCs. The future of startup funding is here.",
  keywords: ["AI accelerator", "startup funding", "VC matching", "pitch analysis", "futarchy", "ICO", "stablecoin"],
  openGraph: {
    title: "SwarmAccelerator | AI-Powered Startup Accelerator",
    description: "Pitch your startup to an intelligent swarm of AI agents. Get instant analysis, valuation, and connect with top VCs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
