"use client";

import { useState } from "react";
import { Plus, Package, FileText, Trash2, Pencil, ExternalLink, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, GuideBanner, EmptyState } from "@/components/ui";
import { productTypeLabel } from "@/lib/utils";
import type { ProductType } from "@/lib/types";

const categoryTone: Record<string, "brand" | "blue" | "green"> = {
  lifeline: "brand",
  option: "blue",
  bundle: "green",
};

const empty = {
  name: "",
  category: "lifeline" as ProductType,
  summary: "",
  points: "",
  materialUrl: "",
};

export default function ProductsPage() {
  const { state, addProduct, updateProduct, removeProduct } = useStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  function startAdd() {
    setForm(empty);
    setEditingId(null);
    setOpen(true);
  }
  function startEdit(id: string) {
    const p = state.products.find((x) => x.id === id);
    if (!p) return;
    setForm({
      name: p.name,
      category: p.category,
      summary: p.summary,
      points: p.points,
      materialUrl: p.materialUrl || "",
    });
    setEditingId(id);
    setOpen(true);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      category: form.category,
      summary: form.summary.trim(),
      points: form.points.trim(),
      materialUrl: form.materialUrl.trim() || undefined,
    };
    if (editingId) updateProduct(editingId, payload);
    else addProduct(payload);
    setForm(empty);
    setEditingId(null);
    setOpen(false);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="商材管理"
        description="提案する商材（電気・ガス・ネット・オプション等）の資料・訴求ポイントを登録。アプローチ文面生成で選んで使えます。"
      >
        <button onClick={startAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> 商材を追加
        </button>
      </PageHeader>

      <GuideBanner>
        商材が複数あるときは、ここに登録しておくと便利だよ📦 商材ごとの概要や訴求ポイント、資料リンクをまとめておけば、
        <span className="font-semibold text-brand-300">アプローチ文面の生成でその内容が反映</span>されて、提案の精度がぐっと上がるんだ！
      </GuideBanner>

      {open && (
        <form onSubmit={submit} className="card mb-4 grid gap-3 p-4 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2">
            <h3 className="text-sm font-semibold text-ink-100">
              {editingId ? "商材を編集" : "商材を追加"}
            </h3>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-ink-400 hover:bg-ink-800">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label className="label">商材名 *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：電気取次（新電力）" required />
          </div>
          <div>
            <label className="label">種別</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductType })}>
              <option value="lifeline">ライフライン</option>
              <option value="option">オプション</option>
              <option value="bundle">セット</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">概要・説明</label>
            <textarea className="input min-h-[5rem]" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="入居者・不動産会社にとっての価値を簡潔に。文面生成に使われます。" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">訴求ポイント（1行に1つ）</label>
            <textarea className="input min-h-[6rem]" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} placeholder={"入居者の開通手続きを一括代行\n御社の工数ゼロ\nご紹介実績に応じた手数料還元"} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">資料リンク（任意・PDFやドライブのURL）</label>
            <input className="input" value={form.materialUrl} onChange={(e) => setForm({ ...form, materialUrl: e.target.value })} placeholder="https://drive.google.com/..." />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary">{editingId ? "保存する" : "追加する"}</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">キャンセル</button>
          </div>
        </form>
      )}

      {state.products.length === 0 ? (
        <EmptyState title="まだ商材が登録されていません" hint="「商材を追加」から、提案したい商材の概要・訴求ポイント・資料リンクを登録しましょう。" />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {state.products.map((p) => (
            <div key={p.id} className="card card-hover p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 shrink-0 text-brand-400" />
                    <h3 className="truncate font-semibold text-ink-50">{p.name}</h3>
                    <Badge tone={categoryTone[p.category]}>{productTypeLabel[p.category]}</Badge>
                  </div>
                  {p.summary && <p className="mt-2 text-xs leading-relaxed text-ink-300">{p.summary}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => startEdit(p.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-ink-100" title="編集">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`「${p.name}」を削除しますか？`)) removeProduct(p.id); }}
                    className="rounded-lg p-1.5 text-ink-400 hover:bg-red-500/15 hover:text-red-300"
                    title="削除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {p.points && (
                <ul className="mt-3 space-y-1">
                  {p.points.split("\n").map((l) => l.trim()).filter(Boolean).map((line, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-ink-200">
                      <span className="text-brand-400">▸</span>
                      {line.replace(/^・/, "")}
                    </li>
                  ))}
                </ul>
              )}

              {p.materialUrl && (
                <a href={p.materialUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800/60 px-2.5 py-1.5 text-xs text-ink-200 hover:border-brand-500/40">
                  <FileText className="h-3.5 w-3.5 text-brand-400" /> 資料を開く <ExternalLink className="h-3 w-3 text-ink-400" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
