import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Orbitron,
  Exo_2,
  Montserrat,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo-2",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: {
    template: "%s | EXERTION UI 2026",
    default: "EXERTION UI 2026",
  },
  description: "EXERTION UI BY EXERCISE FTUI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${exo2.variable} ${montserrat.className} ${montserrat.variable} scroll-smooth antialiased`}
    >
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton theme="dark" />
        <Script
          src="https://apis.google.com/js/api.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
