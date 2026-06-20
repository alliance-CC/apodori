"use client";

import { useState } from "react";
import { Plus, Play, Pause, Target as TargetIcon, Zap, Loader2, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, GuideBanner } from "@/components/ui";
import { campaignStatusLabel, productTypeLabel, fmtDate } from "@/lib/utils";
import type { ProductType } from "@/lib/types";

const statusTone: Record<string, "neutral" | "brand" | "green" | "yellow"> = {
  draft: "neutral",
  review: "yellow",
  running: "green",
  paused: "neutral",
  done: "brand",
};

export default function CampaignsPage() {
  const { state, addCampaign, setCampaignStatus, runExclusionCheck, addActivity, sendActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [auto, setAuto] = useState<{
    id: string;
    total: number;
    done: number;
    sent: number;
    blocked: number;
    finished: boolean;
  } | null>(null);

  // キャンペーンの自動実行（オートパイロット）：
  // 除外チェック → 文面生成 → 送信直前の最終照合 → 送信/ブロック を全リードに自動適用
  async function autoRun(campaignId: string) {
    if (auto && !auto.finished) return;
    runExclusionCheck(campaignId);
    const ready = state.targets.filter(
      (t) => t.campaignId === campaignId && (t.status === "pending" || t.status === "approved")
    );
    if (ready.length === 0) {
      setAuto({ id: campaignId, total: 0, done: 0, sent: 0, blocked: 0, finished: true });
      setTimeout(() => setAuto(null), 5000);
      return;
    }
    const campaign = state.campaigns.find((c) => c.id === campaignId);
    const product =
      state.products.find((p) => p.category === campaign?.productType) || state.products[0];
    setAuto({ id: campaignId, total: ready.length, done: 0, sent: 0, blocked: 0, finished: false });
    let sent = 0;
    let blocked = 0;
    let done = 0;
    for (const t of ready) {
      let subject = "";
      let body = "";
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            companyName: t.companyName,
            storeName: t.storeName,
            contactName: t.contactName,
            productType: campaign?.productType ?? "lifeline",
            productName: product?.name,
            productSummary: product?.summary,
            productPoints: product?.points,
            area: campaign?.area,
            variant: "A",
          }),
        });
        const data = await res.json();
        subject = data.subject;
        body = data.body;
      } catch {
        subject = `【ご提案】${t.companyName}様へ`;
        body = "";
      }
      const activity = addActivity({ targetId: t.id, campaignId, channel: "email", subject, body, variant: "A" });
      const r = sendActivity(activity.id);
      if (r.ok) sent++;
      else blocked++;
      done++;
      setAuto({ id: campaignId, total: ready.length, done, sent, blocked, finished: done === ready.length });
    }
    setTimeout(() => setAuto(null), 8000);
  }
  const [form, setForm] = useState({
    name: "",
    productType: "lifeline" as ProductType,
    area: "",
    targetCriteria: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addCampaign({
      name: form.name.trim(),
      productType: form.productType,
      area: form.area.trim(),
      targetCriteria: form.targetCriteria.trim(),
    });
    setForm({ name: "", productType: "lifeline", area: "", targetCriteria: "" });
    setOpen(false);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="キャンペーン管理"
        description="エリア・商材ごとにアプローチを束ねて管理。稼働・停止をワンクリックで切り替えられます。"
      >
        <button onClick={() => setOpen((v) => !v)} className="btn-primary">
          <Plus className="h-4 w-4" /> 新規キャンペーン
        </button>
      </PageHeader>

      <GuideBanner>
        「<span className="font-semibold text-brand-300">自動実行</span>」を押すと、そのキャンペーンのリードに対して
        <span className="font-semibold text-brand-300">文面生成→除外照合→送信</span>を自動で一括処理するよ⚡
        （デモでは送信は擬似的に記録。実際のメール送信は配信サービス連携で有効化できます）
      </GuideBanner>

      {open && (
        <form onSubmit={submit} className="card mb-4 grid gap-3 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">キャンペーン名 *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：渋谷エリア 新規開拓（ライフライン）" required />
          </div>
          <div>
            <label className="label">商材</label>
            <select className="input" value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value as ProductType })}>
              <option value="lifeline">ライフライン</option>
              <option value="option">オプション</option>
              <option value="bundle">セット</option>
            </select>
          </div>
          <div>
            <label className="label">対象エリア</label>
            <input className="input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="東京都（渋谷区）" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">ターゲット条件</label>
            <input className="input" value={form.targetCriteria} onChange={(e) => setForm({ ...form, targetCriteria: e.target.value })} placeholder="賃貸仲介中心 / 従業員5〜30名 など" />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary">作成する</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">キャンセル</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {state.campaigns.map((c) => {
          const targets = state.targets.filter((t) => t.campaignId === c.id);
          const sent = targets.filter((t) => ["sent", "replied", "deal"].includes(t.status)).length;
          const replied = targets.filter((t) => ["replied", "deal"].includes(t.status)).length;
          const deals = targets.filter((t) => t.status === "deal").length;
          const excluded = targets.filter((t) => t.status === "excluded").length;
          return (
            <div key={c.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink-50">{c.name}</h3>
                    <Badge tone={statusTone[c.status]}>{campaignStatusLabel[c.status]}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">
                    {productTypeLabel[c.productType]} ・ {c.area || "エリア未設定"} ・ 作成 {fmtDate(c.createdAt)}
                  </p>
                  {c.targetCriteria && (
                    <p className="mt-1 text-xs text-ink-500">条件：{c.targetCriteria}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {c.status === "running" ? (
                    <button onClick={() => setCampaignStatus(c.id, "paused")} className="btn-ghost px-3 py-1.5 text-xs">
                      <Pause className="h-3.5 w-3.5" /> 停止
                    </button>
                  ) : (
                    <button onClick={() => setCampaignStatus(c.id, "running")} className="btn-primary px-3 py-1.5 text-xs">
                      <Play className="h-3.5 w-3.5" /> 稼働
                    </button>
                  )}
                  <button
                    onClick={() => autoRun(c.id)}
                    disabled={!!auto && !auto.finished}
                    className="btn-ghost border-brand-500/40 px-3 py-1.5 text-xs text-brand-200 disabled:opacity-50"
                    title="このキャンペーンのリードに自動でアプローチ"
                  >
                    {auto?.id === c.id && !auto.finished ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Zap className="h-3.5 w-3.5" />
                    )}
                    自動実行
                  </button>
                </div>
              </div>

              {auto?.id === c.id && (
                <div className="mt-3 rounded-xl border border-brand-500/30 bg-brand-500/[0.06] p-3 text-xs">
                  {auto.finished ? (
                    <p className="flex items-center gap-1.5 text-emerald-300">
                      <Check className="h-3.5 w-3.5" /> 自動実行 完了：送信 {auto.sent} 件／ブロック {auto.blocked} 件
                      {auto.total === 0 && "（対象リードなし）"}
                    </p>
                  ) : (
                    <>
                      <p className="text-brand-200">
                        オートパイロット稼働中… {auto.done}/{auto.total}（文面生成 → 除外照合 → 送信）
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-800">
                        <div
                          className="h-full bg-brand-gradient transition-all"
                          style={{ width: `${auto.total ? (auto.done / auto.total) * 100 : 0}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <Mini label="対象" value={targets.length} icon={<TargetIcon className="h-3.5 w-3.5" />} />
                <Mini label="送信" value={sent} />
                <Mini label="返信" value={replied} />
                <Mini label="商談" value={deals} highlight />
              </div>
              {excluded > 0 && (
                <p className="mt-2 text-xs text-red-300/80">うち {excluded} 件は除外（既契約等）</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-2 ${highlight ? "border-brand-500/30 bg-brand-500/10" : "border-ink-800 bg-ink-900/40"}`}>
      <div className="flex items-center justify-center gap-1 text-[11px] text-ink-400">
        {icon}{label}
      </div>
      <div className={`text-lg font-bold ${highlight ? "text-brand-300" : "text-ink-50"}`}>{value}</div>
    </div>
  );
}
