import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google"; // [MODIFIED] Added Cinzel
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thyroll D&D App",
  description: "Thyroll kulübü üyeleri için dijital D&D arşivi ve karakter yöneticisi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
