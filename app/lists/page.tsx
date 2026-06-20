"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Search, Check, Ban, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, GuideBanner } from "@/components/ui";
import { targetStatusLabel } from "@/lib/utils";
import type { TargetStatus } from "@/lib/types";

const statusTone: Record<string, "neutral" | "brand" | "green" | "red" | "yellow" | "blue"> = {
  pending: "neutral",
  approved: "brand",
  sent: "blue",
  replied: "yellow",
  deal: "green",
  excluded: "red",
  ng: "red",
};

export default function ListsPage() {
  const { state, runExclusionCheck, setTargetStatus } = useStore();
  const [campaign, setCampaign] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return state.targets
      .filter((t) => (campaign === "all" ? true : t.campaignId === campaign))
      .filter((t) => (status === "all" ? true : t.status === status))
      .filter((t) =>
        q ? `${t.companyName} ${t.storeName ?? ""} ${t.contactName ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true
      )
      .sort((a, b) => b.score - a.score);
  }, [state.targets, campaign, status, q]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="リスト管理"
        description="AIがリストアップした潜在顧客（不動産会社）を、スコア順に確認・承認できます。除外リスト照合は必須処理です。"
      >
        <button
          onClick={() => {
            const r = runExclusionCheck(campaign === "all" ? undefined : campaign);
            setResult(`${r.checked} 件を照合し、${r.excluded} 件を除外しました。`);
          }}
          className="btn-primary"
        >
          <ShieldCheck className="h-4 w-4" /> 除外チェック実行
        </button>
      </PageHeader>

      <GuideBanner>
        各企業にはAIが付けた<span className="font-semibold text-brand-300">スコア</span>が表示されているよ。
        既契約と一致した店舗は自動で「除外」になるから安心してね。良さそうな企業は「承認」してアプローチに進めよう！
      </GuideBanner>

      {result && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <Check className="h-4 w-4" /> {result}
          <button onClick={() => setResult(null)} className="ml-auto text-emerald-300/70 hover:text-emerald-200">閉じる</button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="企業名・担当者で検索" className="input pl-9" />
        </div>
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="input w-auto">
          <option value="all">全キャンペーン</option>
          {state.campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
          <option value="all">全ステータス</option>
          {Object.entries(targetStatusLabel).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-ink-50">{t.companyName}</h3>
                  <Badge tone={statusTone[t.status]}>{targetStatusLabel[t.status]}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-400">
                  {t.storeName} ・ {t.contactName}
                </p>
              </div>
              <ScoreBadge score={t.score} />
            </div>

            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-ink-300">
              {t.researchSummary}
            </p>

            {t.status === "excluded" && t.excludedReason && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300">
                <Ban className="h-3.5 w-3.5" /> 除外理由：{t.excludedReason}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              {t.status === "pending" && (
                <>
                  <button onClick={() => setTargetStatus(t.id, "approved")} className="btn-primary px-3 py-1.5 text-xs">
                    <Check className="h-3.5 w-3.5" /> 承認
                  </button>
                  <button onClick={() => setTargetStatus(t.id, "excluded" as TargetStatus)} className="btn-ghost px-3 py-1.5 text-xs">
                    除外にする
                  </button>
                </>
              )}
              {t.status === "approved" && (
                <Badge tone="brand">アプローチ準備OK</Badge>
              )}
              {t.status === "excluded" && (
                <button onClick={() => setTargetStatus(t.id, "pending")} className="btn-ghost px-3 py-1.5 text-xs">
                  除外を解除
                </button>
              )}
              {(t.status === "sent" || t.status === "replied" || t.status === "deal") && (
                <span className="text-xs text-ink-400">アプローチ進行中</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-ink-400">条件に一致するターゲットがありません。</p>
      )}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 85 ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" :
    score >= 70 ? "text-brand-300 border-brand-500/40 bg-brand-500/10" :
    score > 0 ? "text-ink-300 border-ink-700 bg-ink-800/60" :
    "text-ink-500 border-ink-800 bg-ink-900";
  return (
    <div className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-1.5 ${tone}`}>
      <Star className="h-3.5 w-3.5" />
      <span className="mt-0.5 text-sm font-bold">{score || "—"}</span>
    </div>
  );
}
