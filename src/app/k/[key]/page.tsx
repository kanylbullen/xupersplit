import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { SplitData } from "@/lib/types";
import { SplitApp } from "@/components/split/SplitApp";

async function fetchSplit(key: string): Promise<SplitData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("split_data", { p_key: key });
  // Tolerate both behaviours: the old split_data raised (→ error) on an
  // unknown key; the new one returns { not_found: true } so it can log the
  // failed lookup for enumeration monitoring.
  if (error || !data || (data as { not_found?: boolean }).not_found) return null;
  return data as SplitData;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const data = await fetchSplit(key);
  return {
    title: data ? `${data.split.title} — Tollysplit` : "Tollysplit",
    robots: { index: false },
  };
}

export default async function SplitPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const data = await fetchSplit(key);
  if (!data) notFound();

  return <SplitApp data={data} />;
}
