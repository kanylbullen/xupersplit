import Link from "next/link";
import { NewSplitForm } from "./NewSplitForm";
import { getI18n } from "@/lib/i18n/server";
import { localeDefaultCurrency } from "@/lib/money";
import { neynarEnabled } from "@/lib/neynar";
import { createClient } from "@/lib/supabase/server";

export default async function NewSplitPage() {
  const { dict, locale } = await getI18n();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-black tracking-tight text-primary"
        >
          xupersplit
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-stone-500 hover:text-ink"
        >
          ← {dict.new.toHome}
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-black tracking-tight">
        {dict.new.title}
      </h1>
      <NewSplitForm
        loggedIn={Boolean(user)}
        defaultCurrency={localeDefaultCurrency(locale)}
        fcInvite={neynarEnabled()}
      />
    </main>
  );
}
