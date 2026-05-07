import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaalariPro Lite",
  description:
    "Yksinkertainen tarjouslaskuri maalareille — laskee maalausurakan hinnan ja tallentaa tarjoukset selaimen muistiin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 print-page">
          {children}
        </main>
        <footer className="no-print py-8 text-center text-xs text-muted">
          MaalariPro Lite · Harjoitustyö · OAMK 2026
        </footer>
      </body>
    </html>
  );
}
