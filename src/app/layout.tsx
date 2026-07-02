import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Orbitron,
  Exo_2,
  Montserrat,
} from "next/font/google";
import localFont from "next/font/local";
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

const robotechGp = localFont({
  src: "./fonts/ROBOTECH_GP.ttf",
  variable: "--font-robotech-gp",
});

export const metadata: Metadata = {
  title: {
    template: "%s | EXERTION UI 2026",
    default: "EXERTION UI 2026",
  },
  description: "EXERTION UI adalah sebuah event. EXERTION UI 2026 hadir menjadi wadah bagi mahasiswa dan siswa di Indonesia untuk mengembangkan keterampilan di bidang teknik, teknologi, dan kreativitas umum.",
  applicationName: "EXERTION UI 2026",
  openGraph: {
    siteName: "EXERTION UI 2026",
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
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${exo2.variable} ${montserrat.className} ${montserrat.variable} ${robotechGp.variable} scroll-smooth antialiased`}
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
