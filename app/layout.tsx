import type { Metadata, Viewport } from "next";
import { Cinzel, Playfair_Display, Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CaveMoonlightBackground } from "@/components/layout/CaveMoonlightBackground";
import { LanguageProvider } from "@/lib/i18n/context";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tarot Tajai — Inquire with AI-Powered Tarot",
  description:
    "A contemplative Tarot sanctuary offering grounded, reflective readings powered by AI and timeless wisdom.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#070b0e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${playfairDisplay.variable} ${plusJakartaSans.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body className="font-body relative flex min-h-screen flex-col overflow-x-hidden bg-[#070b0e] text-zinc-100 selection:bg-emerald-500 selection:text-black">
        <LanguageProvider>
          {/* Cave Moonlight & Emerald Cavern Background */}
          <CaveMoonlightBackground />

          {/* Minimalist Top Header */}
          <Header />

          {/* Centered Main Layout (Desktop max 1100px, Mobile-first 360px) */}
          <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-4 py-4 sm:px-6 sm:py-8">
            {children}
          </main>

          {/* App Footer */}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
