"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  ShieldAlert,
  ListChecks,
  Target,
  Send,
  Inbox,
  BarChart3,
  ThumbsUp,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const nav = [
  { href: "/", label: "ホーム", icon: LayoutDashboard, code: "" },
  { href: "/exclusions", label: "除外リスト管理", icon: ShieldAlert, code: "F0", danger: true },
  { href: "/lists", label: "リスト管理", icon: ListChecks, code: "F1" },
  { href: "/campaigns", label: "キャンペーン", icon: Target, code: "" },
  { href: "/outreach", label: "アプローチ実行", icon: Send, code: "F2" },
  { href: "/activities", label: "活動管理", icon: Inbox, code: "F3" },
  { href: "/analytics", label: "分析レポート", icon: BarChart3, code: "F4" },
  { href: "/feedback", label: "AIフィードバック", icon: ThumbsUp, code: "F5" },
  { href: "/settings", label: "設定", icon: Settings, code: "F6" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-2 flex items-center gap-2 rounded-xl px-2 py-3"
      >
        <Logo className="text-xl" />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-gradient text-white shadow-glow"
                  : "text-ink-200 hover:bg-ink-800/70"
              )}
            >
              <Icon
                className={clsx(
                  "h-[18px] w-[18px] shrink-0",
                  !active && item.danger && "text-brand-400"
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.code && (
                <span
                  className={clsx(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                    active
                      ? "bg-white/20 text-white"
                      : item.danger
                      ? "bg-brand-500/15 text-brand-300"
                      : "bg-ink-800 text-ink-400"
                  )}
                >
                  {item.code}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-3 text-[11px] leading-relaxed text-ink-400">
        <p className="font-semibold text-ink-300">株式会社ライフアップ</p>
        <p>営業AIエージェント Demo</p>
      </div>
    </div>
  );
}
