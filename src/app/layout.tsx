import type { Metadata } from "next";
import { DM_Serif_Display, Geist, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer, SmoothScroll } from "@/components/layout";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif-custom",
  weight: ["400"],
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-custom",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-custom",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-custom",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mining Discovery | Premier Mining Marketing & Media Platform",
  description:
    "Mining Discovery is the leading editorial media, marketing, and market intelligence platform for the global mining & metals industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${geist.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#1A1D21] antialiased selection:bg-[#B8860B]/20 selection:text-[#0B1F3A]">
        <SmoothScroll>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
