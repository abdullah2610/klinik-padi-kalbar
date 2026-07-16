"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const ITEMS = [
  { href: "/", label: "Beranda", icon: "home" },
  { href: "/entri", label: "Telusur", icon: "list" },
  { href: "/diagnosa", label: "Gejala", icon: "clipboard" },
  { href: "/foto", label: "Foto", icon: "camera" },
  { href: "/asisten", label: "Asisten", icon: "chat" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function BottomNav() {
  const pathname = usePathname() || "/";
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {ITEMS.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors ${
                  active ? "text-hama" : "text-ink/55 hover:text-ink"
                }`}
              >
                <Icon name={it.icon} size={24} />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
