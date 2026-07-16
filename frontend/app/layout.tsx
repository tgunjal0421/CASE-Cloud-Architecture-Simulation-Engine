import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CASE Simulator — Cloud Architecture Simulation Engine",
  description: "Design, simulate, and analyze cloud architectures before deployment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
