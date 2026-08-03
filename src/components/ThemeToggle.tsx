"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n/client";

// Light/dark/system segmented control. The `mounted` guard keeps the server
// render (which can't know the resolved theme) from mismatching on hydration.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1">
      {(
        [
          ["light", dict.set.light],
          ["dark", dict.set.dark],
          ["system", dict.set.system],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`rounded-lg px-2 py-2 text-sm font-semibold transition-colors ${
            mounted && theme === value
              ? "bg-surface text-ink shadow-sm"
              : "text-stone-500 hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
