"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Search, Check, Ban, Star, UserPlus, Upload, X } from "lucide-react";
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
  const { state, runExclusionCheck, setTargetStatus, addTarget, importTargets } = useStore();
  const [campaign, setCampaign] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const defaultCampaignId =
    campaign !== "all" ? campaign : state.campaigns[0]?.id ?? "";
  const [lead, setLead] = useState({
    campaignId: defaultCampaignId,
    companyName: "",
    storeName: "",
    contactName: "",
    contactEmail: "",
  });
  const [csv, setCsv] = useState("");
  const [csvCampaign, setCsvCampaign] = useState(defaultCampaignId);

  function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!lead.companyName.trim() || !lead.campaignId) return;
    const t = addTarget({
      campaignId: lead.campaignId,
      companyName: lead.companyName.trim(),
      storeName: lead.storeName.trim() || undefined,
      contactName: lead.contactName.trim() || undefined,
      contactEmail: lead.contactEmail.trim() || undefined,
    });
    setLead({ ...lead, companyName: "", storeName: "", contactName: "", contactEmail: "" });
    setShowAdd(false);
    setResult(
      t.status === "excluded"
        ? `「${t.companyName}」を追加しましたが、除外リストと一致したため自動で除外しました。`
        : `「${t.companyName}」をリードに追加しました。`
    );
  }

  function submitCsv() {
    if (!csvCampaign) return;
    const rows = csv
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [companyName, storeName, contactName, contactEmail, phone] = line.split(",").map((s) => s?.trim());
        return { companyName, storeName, contactName, contactEmail, phone };
      })
      .filter((r) => r.companyName);
    const res = importTargets(csvCampaign, rows);
    setCsv("");
    setShowCsv(false);
    setResult(`${res.added} 件のリードを取り込みました（うち ${res.excluded} 件は除外リストと一致し自動除外）。`);
  }

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
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setShowCsv((v) => !v); setShowAdd(false); setCsvCampaign(defaultCampaignId); }} className="btn-ghost">
            <Upload className="h-4 w-4" /> CSV取込
          </button>
          <button onClick={() => { setShowAdd((v) => !v); setShowCsv(false); setLead((l) => ({ ...l, campaignId: defaultCampaignId })); }} className="btn-primary">
            <UserPlus className="h-4 w-4" /> リード追加
          </button>
        </div>
      </div>

      {state.campaigns.length === 0 && (showAdd || showCsv) && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          先に「キャンペーン」を作成してください。リードはキャンペーンに紐づけて登録します。
        </div>
      )}

      {showAdd && state.campaigns.length > 0 && (
        <form onSubmit={submitLead} className="card mb-4 grid gap-3 p-4 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2">
            <h3 className="text-sm font-semibold text-ink-100">リードを追加</h3>
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg p-1 text-ink-400 hover:bg-ink-800"><X className="h-4 w-4" /></button>
          </div>
          <div>
            <label className="label">キャンペーン</label>
            <select className="input" value={lead.campaignId} onChange={(e) => setLead({ ...lead, campaignId: e.target.value })}>
              {state.campaigns.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="label">法人名 *</label>
            <input className="input" value={lead.companyName} onChange={(e) => setLead({ ...lead, companyName: e.target.value })} placeholder="株式会社〇〇不動産" required />
          </div>
          <div>
            <label className="label">店舗名</label>
            <input className="input" value={lead.storeName} onChange={(e) => setLead({ ...lead, storeName: e.target.value })} placeholder="〇〇店" />
          </div>
          <div>
            <label className="label">担当者</label>
            <input className="input" value={lead.contactName} onChange={(e) => setLead({ ...lead, contactName: e.target.value })} placeholder="山田 太郎" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">メールアドレス</label>
            <input className="input" value={lead.contactEmail} onChange={(e) => setLead({ ...lead, contactEmail: e.target.value })} placeholder="info@example.co.jp" />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary">追加（自動で除外チェック）</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">キャンセル</button>
          </div>
        </form>
      )}

      {showCsv && state.campaigns.length > 0 && (
        <div className="card mb-4 p-4">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-sm font-semibold text-ink-100">CSVでリード一括取込</h3>
            <select className="input w-auto" value={csvCampaign} onChange={(e) => setCsvCampaign(e.target.value)}>
              {state.campaigns.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <p className="mb-2 text-xs text-ink-400">1行1件。形式： <code className="text-ink-200">法人名,店舗名,担当者,メール,電話</code></p>
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={5} className="input font-mono text-xs"
            placeholder={"株式会社サンプル不動産,渋谷店,佐藤,info@sample.jp,03-1111-2222"} />
          <div className="mt-2 flex gap-2">
            <button onClick={submitCsv} className="btn-primary">取り込む（自動で除外チェック）</button>
            <button onClick={() => setShowCsv(false)} className="btn-ghost">キャンセル</button>
          </div>
        </div>
      )}

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
