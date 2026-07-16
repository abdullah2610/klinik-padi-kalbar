import type { Metadata } from "next";
import BandingClient from "@/components/BandingClient";
import { entries, entryBySlug, relatedEntries } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Bandingkan Entri",
  description:
    "Sandingkan 2–3 gangguan padi yang sering tertukar, fokus pada ciri pembeda.",
};

export default async function BandingPage({
  searchParams,
}: {
  searchParams: Promise<{ fokus?: string }>;
}) {
  const { fokus } = await searchParams;
  let initial: string[] = [];
  const f = fokus ? entryBySlug(fokus) : undefined;
  if (f) {
    initial = [f.slug, ...relatedEntries(f, 2).map((e) => e.slug)];
  } else {
    // default: dua yang klasik tertukar (penggerek vs orong-orong)
    const a = entries.find((e) => e.no === 1);
    const b = entries.find((e) => e.no === 7);
    initial = [a?.slug, b?.slug].filter((s): s is string => !!s);
  }

  return <BandingClient entries={entries} initial={initial} />;
}
