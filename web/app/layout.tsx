import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const tajawal = Tajawal({ 
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "بصائر - كتاب رقمي",
  description: "المكتبة الرقمية لكتاب بصائر في الكون والحياة والدين",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className={`${tajawal.className} bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-300`}>
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
