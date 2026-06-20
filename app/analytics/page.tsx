"use client";

import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Lightbulb, Download } from "lucide-react";
import { useStore } from "@/lib/store";
import { StatCard, PageHeader, GuideBanner } from "@/components/ui";
import { pct, replyClassLabel } from "@/lib/utils";

const PIE_COLORS = ["#34D399", "#FBBF24", "#38BDF8", "#F87171"];

export default function AnalyticsPage() {
  const { state } = useStore();

  const sent = state.kpi.reduce((a, k) => a + k.sent, 0);
  const opened = state.kpi.reduce((a, k) => a + k.opened, 0);
  const replied = state.kpi.reduce((a, k) => a + k.replied, 0);
  const deals = state.kpi.reduce((a, k) => a + k.deals, 0);

  // A/B variant performance
  const variantData = (["A", "B"] as const).map((v) => {
    const acts = state.activities.filter((a) => a.variant === v && a.status !== "blocked" && a.status !== "queued");
    const s = acts.length;
    const r = acts.filter((a) => a.repliedAt).length;
    return { name: `パターン${v}`, 送信: s, 返信: r };
  });

  // reply classification distribution
  const classData = (["interested", "scheduling", "considering", "ng"] as const).map((c) => ({
    name: replyClassLabel[c],
    value: state.replies.filter((r) => r.classification === c).length,
  }));
  const hasClass = classData.some((c) => c.value > 0);

  return (
    <div className="animate-fade-in">
      <PageHeader title="分析レポート" description="キャンペーンの配信データを分析し、改善提案を出力します。">
        <button className="btn-ghost" onClick={() => alert("デモ版のためエクスポートはスタブです（CSV/PDF対応予定）")}>
          <Download className="h-4 w-4" /> エクスポート
        </button>
      </PageHeader>

      <GuideBanner>
        送信数・開封率・返信率・商談獲得率の推移をグラフで確認できるよ📊 文面パターンの効果比較もここでチェック！
      </GuideBanner>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="開封率" value={pct(opened, sent)} sub={`${opened} / ${sent}`} accent spark={state.kpi.map((k) => k.opened)} />
        <StatCard label="返信率" value={pct(replied, sent)} sub={`${replied} / ${sent}`} spark={state.kpi.map((k) => k.replied)} />
        <StatCard label="商談獲得率" value={pct(deals, sent)} sub={`${deals} / ${sent}`} accent spark={state.kpi.map((k) => k.deals)} />
        <StatCard label="返信→商談" value={pct(deals, replied)} sub="返信からの転換率" />
      </div>

      <div className="mt-4 card p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink-100">日次トレンド（14日間）</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={state.kpi} margin={{ left: -18, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262E" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#4B4B57" />
              <YAxis tick={{ fontSize: 11 }} stroke="#4B4B57" width={32} />
              <Tooltip contentStyle={{ background: "#121216", border: "1px solid #33333d", borderRadius: 12 }} labelStyle={{ color: "#f6f6f7" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="sent" name="送信" stroke="#FF6A13" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="opened" name="開封" stroke="#FBBF24" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="replied" name="返信" stroke="#38BDF8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="deals" name="商談" stroke="#34D399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-100">文面パターン別パフォーマンス（A/B）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={variantData} margin={{ left: -18, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262E" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#4B4B57" />
                <YAxis tick={{ fontSize: 11 }} stroke="#4B4B57" width={32} />
                <Tooltip contentStyle={{ background: "#121216", border: "1px solid #33333d", borderRadius: 12 }} labelStyle={{ color: "#f6f6f7" }} cursor={{ fill: "rgba(255,106,19,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="送信" fill="#F2570C" radius={[6, 6, 0, 0]} />
                <Bar dataKey="返信" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-100">返信内容の分類</h3>
          <div className="h-64">
            {hasClass ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={classData.filter((d) => d.value > 0)} dataKey="value" nameKey="name" innerRadius={50} outerRadius={88} paddingAngle={3}>
                    {classData.filter((d) => d.value > 0).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#0B0B0E" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#121216", border: "1px solid #33333d", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-400">返信データがありません</div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-4 card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-100">
          <Lightbulb className="h-4 w-4 text-amber-400" /> AIによる改善提案
        </h3>
        <ul className="space-y-2 text-sm text-ink-200">
          <li className="flex gap-2"><span className="text-brand-400">▸</span> 開封率が高い時間帯（午前9〜11時）への送信集中で返信率の向上が見込めます。</li>
          <li className="flex gap-2"><span className="text-brand-400">▸</span> パターンA（課題提起型）の返信率が高め。次回キャンペーンは課題提起型を主軸に推奨。</li>
          <li className="flex gap-2"><span className="text-brand-400">▸</span> スコア85以上の企業からの商談化率が突出。高スコア層への優先アプローチを継続。</li>
        </ul>
      </div>
    </div>
  );
}
