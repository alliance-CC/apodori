"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, RotateCcw, FlaskConical, Briefcase } from "lucide-react";
import clsx from "clsx";
import { Sidebar } from "./Sidebar";
import { Logo } from "@/components/brand/Logo";
import { useStore } from "@/lib/store";

const titles: Record<string, string> = {
  "/": "ホーム",
  "/exclusions": "除外リスト管理",
  "/lists": "リスト管理",
  "/campaigns": "キャンペーン管理",
  "/outreach": "アプローチ実行",
  "/activities": "活動管理",
  "/analytics": "分析レポート",
  "/feedback": "AIフィードバック学習",
  "/settings": "設定",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { mode, setMode, resetMode } = useStore();

  const title =
    Object.entries(titles).find(([href]) =>
      href === "/" ? pathname === "/" : pathname.startsWith(href)
    )?.[1] || "ホーム";

  return (
    <div className="min-h-screen bg-ink-950 bg-ink-radial">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-ink-800 bg-ink-950/80 backdrop-blur lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <div
        className={clsx(
          "fixed inset-0 z-40 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-black/60 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={clsx(
            "absolute inset-y-0 left-0 w-72 border-r border-ink-800 bg-ink-950 transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <button
            aria-label="閉じる"
            className="absolute right-2 top-3 rounded-lg p-2 text-ink-400 hover:bg-ink-800"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ink-800 bg-ink-950/80 px-4 backdrop-blur">
          <button
            aria-label="メニュー"
            className="rounded-lg p-2 text-ink-200 hover:bg-ink-800 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <Logo className="text-lg" />
          </div>
          <h1 className="hidden text-base font-semibold text-ink-50 lg:block">
            {title}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {/* デモ / 実データ モード切替 */}
            <div className="flex items-center rounded-xl border border-ink-700 bg-ink-900/70 p-0.5">
              <button
                onClick={() => setMode("demo")}
                className={clsx(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  mode === "demo"
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "text-ink-300 hover:text-ink-100"
                )}
                title="デモデータ（サンプル）"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">デモ</span>
              </button>
              <button
                onClick={() => setMode("live")}
                className={clsx(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  mode === "live"
                    ? "bg-emerald-500 text-white"
                    : "text-ink-300 hover:text-ink-100"
                )}
                title="実データ（本番運用）"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">実データ</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (mode === "demo") {
                  if (confirm("デモデータを初期状態に戻しますか？（実データには影響しません）"))
                    resetMode();
                } else {
                  if (confirm("実データをすべて削除しますか？この操作は元に戻せません。"))
                    resetMode();
                }
              }}
              className="btn-ghost px-2.5 py-1.5 text-xs"
              title={mode === "demo" ? "デモデータを初期化" : "実データを全削除"}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {mode === "demo" ? "デモをリセット" : "実データをクリア"}
              </span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
