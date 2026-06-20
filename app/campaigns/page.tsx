"use client";

import { useState } from "react";
import { Plus, Play, Pause, Target as TargetIcon } from "lucide-react";
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
  const { state, addCampaign, setCampaignStatus } = useStore();
  const [open, setOpen] = useState(false);
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
        キャンペーンごとに対象エリアや商材を分けて運用できるよ🎯 「稼働中」にするとアプローチが始まるんだ。
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
            <div key={c.id} className="card p-5">
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
                {c.status === "running" ? (
                  <button onClick={() => setCampaignStatus(c.id, "paused")} className="btn-ghost px-3 py-1.5 text-xs">
                    <Pause className="h-3.5 w-3.5" /> 停止
                  </button>
                ) : (
                  <button onClick={() => setCampaignStatus(c.id, "running")} className="btn-primary px-3 py-1.5 text-xs">
                    <Play className="h-3.5 w-3.5" /> 稼働
                  </button>
                )}
              </div>

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
