import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Icon from "@/components/Icon";
import { konten } from "@/lib/konten";

const APP_NAME = "Klinik Padi Kalbar";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} — Buku Saku OPT & Hara Padi`,
    template: `%s · ${APP_NAME}`,
  },
  description: konten.meta.subjudul
    ? `${konten.meta.judul} ${konten.meta.subjudul}. Identifikasi cepat & pengendalian hama terpadu (PHT).`
    : "Buku saku digital OPT & hara padi lahan tadah hujan Kalimantan Barat.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1f7a43",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-hama px-4 py-2.5 text-white">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <Icon name="leaf" size={20} />
              </span>
              <span className="leading-tight">
                Klinik Padi <span className="text-padi">Kalbar</span>
              </span>
            </Link>
            <Link
              href="/entri"
              aria-label="Cari entri"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25"
            >
              <Icon name="search" size={20} />
            </Link>
          </header>

          <main className="flex-1 pb-24">{children}</main>
        </div>

        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
