import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { SplitData } from "@/lib/types";
import { SplitApp } from "@/components/split/SplitApp";

async function fetchSplit(key: string): Promise<SplitData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("split_data", { p_key: key });
  if (error || !data) return null;
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
