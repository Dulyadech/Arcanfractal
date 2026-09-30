import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Plus_Jakarta_Sans, Inter } from "next/font/google";
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
  title: "Tarot Tajai",
  description: "Tarot Tajai - Midnight Mysticism",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${playfairDisplay.variable} ${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground font-body flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
