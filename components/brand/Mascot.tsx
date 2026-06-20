"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, X, MessageCircle } from "lucide-react";
import { LightKun } from "./LightKun";
import { guideFor } from "@/lib/guide";

/**
 * 案内人「ライトくん」。画面右下に常駐し、ページごとに使い方を案内する。
 */
export function Mascot() {
  const pathname = usePathname();
  const content = guideFor(pathname);
  const [open, setOpen] = useState(true);
  const [tip, setTip] = useState(0);

  // ページ遷移で先頭のヒントに戻し、フキダシを開く
  useEffect(() => {
    setTip(0);
    setOpen(true);
  }, [pathname]);

  const lastTip = tip >= content.tips.length - 1;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex items-end gap-2 sm:bottom-6 sm:right-6">
      {open && (
        <div className="pointer-events-auto mb-2 w-[78vw] max-w-sm animate-fade-in rounded-2xl border border-brand-500/30 bg-ink-900/95 p-4 shadow-glow backdrop-blur">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-brand-300">{content.title}</p>
            <button
              aria-label="閉じる"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-ink-400 hover:bg-ink-800 hover:text-ink-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="min-h-[3.5rem] text-sm leading-relaxed text-ink-100">
            {content.tips[tip]}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              {content.tips.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === tip ? "bg-brand-500" : "bg-ink-700"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setTip((t) => (lastTip ? 0 : t + 1))}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              {lastTip ? "最初から" : "次へ"}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        aria-label="案内人ライトくん"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto relative shrink-0 transition-transform hover:scale-105 active:scale-95"
      >
        <LightKun className="h-24 w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] sm:h-28" float />
        {!open && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow">
            <MessageCircle className="h-3.5 w-3.5" />
          </span>
        )}
      </button>
    </div>
  );
}
