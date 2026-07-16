"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "kpk:favorit";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    // beri tahu tab/komponen lain
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  } catch {
    /* kuota penuh / private mode: abaikan */
  }
}

/** Daftar seluruh slug favorit (reaktif). */
export function useFavorites(): string[] {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(read());
    const onChange = (e: StorageEvent) => {
      if (e.key === null || e.key === KEY) setList(read());
    };
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);
  return list;
}

/** Status favorit satu slug + fungsi toggle. */
export function useFavorite(slug: string): [boolean, () => void] {
  const [fav, setFav] = useState(false);
  useEffect(() => {
    setFav(read().includes(slug));
    const onChange = (e: StorageEvent) => {
      if (e.key === null || e.key === KEY) setFav(read().includes(slug));
    };
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, [slug]);

  const toggle = useCallback(() => {
    const cur = read();
    const next = cur.includes(slug)
      ? cur.filter((s) => s !== slug)
      : [...cur, slug];
    write(next);
    setFav(next.includes(slug));
  }, [slug]);

  return [fav, toggle];
}
