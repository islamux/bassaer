import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import { getAllChapters } from "@/lib/contentLoader";

const tajawal = Tajawal({ 
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "بصائر - كتاب رقمي",
  description: "المكتبة الرقمية لكتاب بصائر في الكون والحياة والدين",
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "بصائر دون اتصال بالنت",
    "msapplication-TileColor": "#8B6914",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B6914",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chapters = getAllChapters();

  return (
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")})()`
        }} />
      </head>
      <body className={`${tajawal.className} bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-300`}>
        <ClientShell chapters={chapters}>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
