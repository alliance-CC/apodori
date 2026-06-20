"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  CalendarCheck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { StatCard, GuideBanner, Badge } from "@/components/ui";
import { fmtDate, fmtDateTime, pct, targetStatusLabel } from "@/lib/utils";

export default function HomePage() {
  const { state } = useStore();

  const sent = state.kpi.reduce((a, k) => a + k.sent, 0);
  const opened = state.kpi.reduce((a, k) => a + k.opened, 0);
  const replied = state.kpi.reduce((a, k) => a + k.replied, 0);
  const dealsCount = state.deals.length;
  const activeExclusions = state.exclusions.filter((e) => e.isActive).length;

  const statusCounts = state.targets.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const pipeline: { key: string; label: string }[] = [
    { key: "pending", label: targetStatusLabel.pending },
    { key: "approved", label: targetStatusLabel.approved },
    { key: "sent", label: targetStatusLabel.sent },
    { key: "replied", label: targetStatusLabel.replied },
    { key: "deal", label: targetStatusLabel.deal },
    { key: "excluded", label: targetStatusLabel.excluded },
  ];

  return (
    <div className="animate-fade-in">
      <GuideBanner>
        <span className="font-semibold text-ink-50">こんにちは！</span>{" "}
        営業AIエージェントのホームだよ。今日も新規不動産店舗とのアポ獲得を、ぼくがサポートするね☀️
        まずは数字をチェックしてみよう。
      </GuideBanner>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="送信数（14日間）" value={sent.toLocaleString()} sub="メール配信の合計" accent />
        <StatCard label="開封率" value={pct(opened, sent)} sub={`${opened} 件開封`} />
        <StatCard label="返信率" value={pct(replied, sent)} sub={`${replied} 件返信`} />
        <StatCard label="獲得商談" value={dealsCount} sub="アポイント確定" accent />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-100">
              <TrendingUp className="h-4 w-4 text-brand-400" />
              送信・返信の推移
            </h3>
            <Link
              href="/analytics"
              className="flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200"
            >
              分析へ <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={state.kpi} margin={{ left: -20, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6A13" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#FF6A13" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262E" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#4B4B57" />
                <YAxis tick={{ fontSize: 11 }} stroke="#4B4B57" width={36} />
                <Tooltip
                  contentStyle={{ background: "#121216", border: "1px solid #33333d", borderRadius: 12 }}
                  labelStyle={{ color: "#f6f6f7" }}
                />
                <Area type="monotone" dataKey="sent" name="送信" stroke="#FF6A13" fill="url(#gSent)" strokeWidth={2} />
                <Area type="monotone" dataKey="replied" name="返信" stroke="#38BDF8" fill="url(#gRep)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exclusion safety */}
        <div className="card flex flex-col p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-100">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            誤送信ガード（F0）
          </h3>
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
            <div className="text-2xl font-bold text-emerald-300">
              {activeExclusions}
            </div>
            <div className="text-xs text-ink-300">
              件の店舗を<br />除外対象として保護中
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-ink-400">Salesforce 最終同期</dt>
              <dd className="text-ink-200">{fmtDate(state.lastSync.salesforce)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-400">Sheets 最終同期</dt>
              <dd className="text-ink-200">{fmtDate(state.lastSync.sheets)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-400">三重チェック</dt>
              <dd><Badge tone="green">有効</Badge></dd>
            </div>
          </dl>
          <Link href="/exclusions" className="btn-ghost mt-auto pt-3 text-xs" style={{ marginTop: "1rem" }}>
            除外リストを管理 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Pipeline */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-ink-100">パイプライン（ターゲット {state.targets.length} 件）</h3>
          <div className="space-y-2.5">
            {pipeline.map((p) => {
              const n = statusCounts[p.key] || 0;
              const w = state.targets.length ? (n / state.targets.length) * 100 : 0;
              return (
                <div key={p.key} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-ink-300">{p.label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-800">
                    <div
                      className={
                        p.key === "excluded"
                          ? "h-full rounded-full bg-red-500/70"
                          : p.key === "deal"
                          ? "h-full rounded-full bg-emerald-500/80"
                          : "h-full rounded-full bg-brand-gradient"
                      }
                      style={{ width: `${Math.max(w, n ? 6 : 0)}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold text-ink-100">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent deals */}
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-100">
            <CalendarCheck className="h-4 w-4 text-brand-400" />
            直近の商談
          </h3>
          <ul className="space-y-3">
            {state.deals.map((d) => (
              <li key={d.id} className="rounded-xl border border-ink-800 bg-ink-900/40 p-3">
                <p className="text-sm font-medium text-ink-50">{d.companyName}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {fmtDateTime(d.scheduledAt)}・担当 {d.assignee}
                </p>
              </li>
            ))}
            {state.deals.length === 0 && (
              <li className="text-xs text-ink-400">まだ商談はありません。</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
