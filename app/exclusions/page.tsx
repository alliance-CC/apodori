"use client";

import { useMemo, useState } from "react";
import {
  RefreshCw,
  Plus,
  Upload,
  ShieldCheck,
  Search,
  AlertTriangle,
  Cloud,
  Sheet,
  Check,
  Undo2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, GuideBanner } from "@/components/ui";
import { exclusionTypeLabel, fmtDateTime } from "@/lib/utils";
import type { ExclusionType } from "@/lib/types";

const typeTone: Record<string, "red" | "yellow" | "blue" | "neutral"> = {
  contracted: "red",
  opted_out: "yellow",
  ng_response: "blue",
  manual: "neutral",
};

export default function ExclusionsPage() {
  const {
    state,
    runSync,
    runExclusionCheck,
    addExclusion,
    setExclusionActive,
    importExclusions,
  } = useStore();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showActive, setShowActive] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  // form
  const [form, setForm] = useState({
    companyName: "",
    storeName: "",
    email: "",
    phone: "",
    address: "",
    type: "manual" as ExclusionType,
    reason: "",
  });
  const [csv, setCsv] = useState("");

  const filtered = useMemo(() => {
    return state.exclusions.filter((e) => {
      if (showActive && !e.isActive) return false;
      if (filter !== "all" && e.type !== filter) return false;
      if (q) {
        const hay = `${e.companyName} ${e.storeName ?? ""} ${e.email ?? ""} ${e.phone ?? ""} ${e.address ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [state.exclusions, q, filter, showActive]);

  const activeCount = state.exclusions.filter((e) => e.isActive).length;

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.companyName.trim()) return;
    addExclusion({
      companyName: form.companyName.trim(),
      storeName: form.storeName.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      type: form.type,
      reason: form.reason.trim() || undefined,
    });
    setForm({ companyName: "", storeName: "", email: "", phone: "", address: "", type: "manual", reason: "" });
    setShowForm(false);
  }

  function submitCsv() {
    // 形式: 法人名,店舗名,メール,電話,住所
    const rows = csv
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [companyName, storeName, email, phone, address] = line.split(",").map((s) => s?.trim());
        return { companyName, storeName, email, phone, address, type: "manual" as ExclusionType, reason: "CSV一括インポート" };
      })
      .filter((r) => r.companyName);
    const n = importExclusions(rows);
    setCsv("");
    setShowCsv(false);
    setCheckResult(`${n} 件を除外リストに追加しました。`);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="除外リスト管理"
        description="既契約店舗・アプローチNG先を一元管理。リスト生成時・文面生成前・送信直前の三重チェックで誤送信ゼロを保証します。"
      >
        <button
          onClick={() => {
            const r = runExclusionCheck();
            setCheckResult(`除外チェック完了：${r.checked} 件を照合し、${r.excluded} 件を除外しました。`);
          }}
          className="btn-primary"
        >
          <ShieldCheck className="h-4 w-4" />
          除外チェック実行
        </button>
      </PageHeader>

      <GuideBanner tone="warn">
        <span className="font-semibold text-brand-300">ここが一番大事な場所だよ⚠️</span>{" "}
        契約中の店舗には絶対にアプローチしないよう、ぼくが見張っているんだ。送信の直前にも必ずもう一度チェックして、引っかかったら物理的にブロックするよ！
      </GuideBanner>

      {checkResult && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <Check className="h-4 w-4" />
          {checkResult}
          <button onClick={() => setCheckResult(null)} className="ml-auto text-emerald-300/70 hover:text-emerald-200">
            閉じる
          </button>
        </div>
      )}

      {/* Sync status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SyncCard
          icon={<Cloud className="h-4 w-4 text-sky-400" />}
          title="Salesforce 同期"
          desc="契約管理のマスターDB"
          last={state.lastSync.salesforce}
          onSync={() => {
            runSync("salesforce");
            setCheckResult("Salesforce と同期しました。");
          }}
        />
        <SyncCard
          icon={<Sheet className="h-4 w-4 text-emerald-400" />}
          title="Google Sheets 同期"
          desc="補助的な管理リスト"
          last={state.lastSync.sheets}
          onSync={() => {
            runSync("sheets");
            setCheckResult("Google スプレッドシートと同期しました。");
          }}
        />
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-100">
            <ShieldCheck className="h-4 w-4 text-brand-400" />
            照合タイミング（多重チェック）
          </div>
          <ol className="mt-3 space-y-1.5 text-xs text-ink-300">
            <li>① リスト作成時に除外</li>
            <li>② 文面生成前に照合</li>
            <li>③ 送信直前に最終照合・物理ブロック</li>
          </ol>
          <p className="mt-3 text-2xl font-bold text-brand-300">
            {activeCount}
            <span className="ml-1 text-xs font-normal text-ink-400">件を保護中</span>
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="法人名・メール・電話で検索"
            className="input pl-9"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
          <option value="all">すべての種別</option>
          <option value="contracted">契約中</option>
          <option value="opted_out">配信停止</option>
          <option value="ng_response">NG返信</option>
          <option value="manual">手動</option>
        </select>
        <label className="chip cursor-pointer">
          <input
            type="checkbox"
            checked={showActive}
            onChange={(e) => setShowActive(e.target.checked)}
            className="accent-brand-500"
          />
          有効のみ
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setShowCsv((v) => !v); setShowForm(false); }} className="btn-ghost">
            <Upload className="h-4 w-4" /> CSV
          </button>
          <button onClick={() => { setShowForm((v) => !v); setShowCsv(false); }} className="btn-ghost">
            <Plus className="h-4 w-4" /> 手動で追加
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={submitForm} className="card mt-3 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="法人名 *">
            <input className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="株式会社〇〇不動産" required />
          </Field>
          <Field label="店舗名">
            <input className="input" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} placeholder="〇〇店" />
          </Field>
          <Field label="種別">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ExclusionType })}>
              <option value="manual">手動</option>
              <option value="contracted">契約中</option>
              <option value="opted_out">配信停止</option>
              <option value="ng_response">NG返信</option>
            </select>
          </Field>
          <Field label="メールアドレス">
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@example.co.jp" />
          </Field>
          <Field label="電話番号">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03-0000-0000" />
          </Field>
          <Field label="住所">
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="東京都〇〇区…" />
          </Field>
          <Field label="除外理由" className="sm:col-span-2 lg:col-span-3">
            <input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="競合のため / 契約中 など" />
          </Field>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
            <button type="submit" className="btn-primary">追加する</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">キャンセル</button>
          </div>
        </form>
      )}

      {/* CSV import */}
      {showCsv && (
        <div className="card mt-3 p-4">
          <p className="mb-2 text-xs text-ink-400">
            1行1件で貼り付け。形式： <code className="text-ink-200">法人名,店舗名,メール,電話,住所</code>
          </p>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={5}
            className="input font-mono text-xs"
            placeholder={"株式会社サンプル不動産,サンプル渋谷店,info@sample.jp,03-1111-2222,東京都渋谷区…"}
          />
          <div className="mt-2 flex gap-2">
            <button onClick={submitCsv} className="btn-primary">インポート</button>
            <button onClick={() => setShowCsv(false)} className="btn-ghost">キャンセル</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-left text-xs text-ink-400">
                <th className="px-4 py-3 font-medium">法人名 / 店舗</th>
                <th className="px-4 py-3 font-medium">種別</th>
                <th className="px-4 py-3 font-medium">連絡先</th>
                <th className="px-4 py-3 font-medium">由来</th>
                <th className="px-4 py-3 font-medium">理由</th>
                <th className="px-4 py-3 font-medium">更新</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-ink-800/60 last:border-0 hover:bg-ink-800/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-50">{e.companyName}</div>
                    {e.storeName && <div className="text-xs text-ink-400">{e.storeName}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={typeTone[e.type]}>{exclusionTypeLabel[e.type]}</Badge>
                    {!e.isActive && <Badge className="ml-1" tone="neutral">解除済</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-300">
                    {e.email && <div>{e.email}</div>}
                    {e.phone && <div>{e.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-400">{sourceLabel(e.source)}</td>
                  <td className="px-4 py-3 text-xs text-ink-400">{e.reason || "—"}</td>
                  <td className="px-4 py-3 text-xs text-ink-400">{fmtDateTime(e.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {e.isActive ? (
                      <button
                        onClick={() => {
                          if (confirm(`「${e.companyName}」を除外解除しますか？再アプローチ対象に戻ります。`))
                            setExclusionActive(e.id, false);
                        }}
                        className="btn-ghost px-2.5 py-1 text-xs"
                      >
                        <Undo2 className="h-3.5 w-3.5" /> 解除
                      </button>
                    ) : (
                      <button onClick={() => setExclusionActive(e.id, true)} className="btn-ghost px-2.5 py-1 text-xs">
                        再設定
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-400">
                    <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-ink-500" />
                    条件に一致する除外先がありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-500">
        ※ Salesforce の契約終了時もシステム側で自動解除はしません（手動確認を必須とします）。同期エラー時は送信バッチを自動停止し、管理者に通知します。
      </p>
    </div>
  );
}

function SyncCard({
  icon,
  title,
  desc,
  last,
  onSync,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  last?: string;
  onSync: () => void;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-100">
            {icon}
            {title}
          </div>
          <p className="mt-0.5 text-xs text-ink-400">{desc}</p>
        </div>
        <Badge tone="green">接続済</Badge>
      </div>
      <p className="mt-3 text-xs text-ink-400">最終同期：{fmtDateTime(last)}</p>
      <button onClick={onSync} className="btn-ghost mt-3 w-full text-xs">
        <RefreshCw className="h-3.5 w-3.5" /> 今すぐ同期
      </button>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function sourceLabel(s: string) {
  return { salesforce: "Salesforce", sheets: "Sheets", manual: "手動", system: "システム" }[s] || s;
}
