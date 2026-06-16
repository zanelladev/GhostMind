import type { Metadata } from "next";
import { Inter, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300"],
  variable: "--font-dm-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GhostMind — Simulador de agentes inteligentes",
  description:
    "Simulador estilo Pac-Man: fantasmas caçam com A* e o Pac-Man foge com Greedy Best-First.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${dmSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
