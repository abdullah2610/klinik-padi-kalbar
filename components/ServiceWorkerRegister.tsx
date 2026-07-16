"use client";

import { useEffect } from "react";

// Daftarkan service worker untuk cache konten (offline-ready, Rencana §4/§12).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // hindari cache saat dev
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* diam: offline hanyalah lapisan tambahan */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
