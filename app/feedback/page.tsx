"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Brain, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, GuideBanner } from "@/components/ui";
import { fmtDateTime } from "@/lib/utils";

export default function FeedbackPage() {
  const { state, addFeedback } = useStore();
  const [rated, setRated] = useState<Record<string, "good" | "bad">>({});

  const good = state.feedbacks.filter((f) => f.rating === "good").length;
  const bad = state.feedbacks.filter((f) => f.rating === "bad").length;
  const total = state.feedbacks.length;
  const goodRatio = total ? Math.round((good / total) * 100) : 0;
  // 学習レベル（デモ用の簡易指標）
  const level = Math.min(5, 1 + Math.floor(total / 3));

  // 未評価の生成文面（直近）
  const toRate = state.activities
    .filter((a) => a.subject)
    .slice(0, 6)
    .filter((a) => !rated[a.id]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AIフィードバック学習"
        description="Good/Bad のワンクリック評価でAIの精度を継続的に改善。専門知識は不要です。"
      />

      <GuideBanner>
        みんなのGood/Bad評価を集めて、ぼくのAIをどんどん賢くしていくよ🧠 ワンクリックでOK、専門知識はいらないよ！
      </GuideBanner>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-100">
            <Brain className="h-4 w-4 text-brand-400" /> 学習の進捗
          </div>
          <p className="mt-4 text-xs text-ink-400">AI学習レベル</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-3xl font-bold text-brand-300">Lv.{level}</span>
            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                <div className="h-full bg-brand-gradient" style={{ width: `${(level / 5) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-ink-300">Good 評価の割合</span>
                <span className="font-semibold text-emerald-300">{goodRatio}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                <div className="h-full bg-emerald-500/80" style={{ width: `${goodRatio}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-2">
                <div className="text-lg font-bold text-emerald-300">{good}</div>
                <div className="text-[11px] text-ink-400">Good</div>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-2">
                <div className="text-lg font-bold text-red-300">{bad}</div>
                <div className="text-[11px] text-ink-400">Bad</div>
              </div>
              <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-2">
                <div className="text-lg font-bold text-ink-100">{total}</div>
                <div className="text-[11px] text-ink-400">合計</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate messages */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-ink-100">生成文面を評価する</h3>
          {toRate.length === 0 ? (
            <p className="text-sm text-ink-400">評価できる新しい文面はありません。アプローチ実行で文面を生成すると、ここで評価できます。</p>
          ) : (
            <ul className="space-y-2">
              {toRate.map((a) => {
                const t = state.targets.find((x) => x.id === a.targetId);
                return (
                  <li key={a.id} className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/40 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink-100">{a.subject}</p>
                      <p className="text-xs text-ink-400">{t?.companyName} {a.variant ? `・パターン${a.variant}` : ""}</p>
                    </div>
                    <button
                      onClick={() => { addFeedback({ targetType: "message", targetId: a.id, rating: "good" }); setRated((r) => ({ ...r, [a.id]: "good" })); }}
                      className="btn-ghost px-2.5 py-1.5 text-xs"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> Good
                    </button>
                    <button
                      onClick={() => { addFeedback({ targetType: "message", targetId: a.id, rating: "bad" }); setRated((r) => ({ ...r, [a.id]: "bad" })); }}
                      className="btn-ghost px-2.5 py-1.5 text-xs"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" /> Bad
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {Object.keys(rated).length > 0 && (
            <p className="mt-3 flex items-center gap-1 text-xs text-emerald-300">
              <Check className="h-3.5 w-3.5" /> 評価を記録しました。次回の生成に反映されます。
            </p>
          )}
        </div>
      </div>

      {/* Log */}
      <h3 className="mb-3 mt-6 text-sm font-semibold text-ink-100">評価ログ</h3>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-left text-xs text-ink-400">
                <th className="px-4 py-3 font-medium">対象</th>
                <th className="px-4 py-3 font-medium">評価</th>
                <th className="px-4 py-3 font-medium">コメント</th>
                <th className="px-4 py-3 font-medium">日時</th>
              </tr>
            </thead>
            <tbody>
              {state.feedbacks.map((f) => (
                <tr key={f.id} className="border-b border-ink-800/60 last:border-0">
                  <td className="px-4 py-3 text-xs text-ink-300">
                    {f.targetType === "message" ? "営業文面" : f.targetType === "list" ? "リスト企業" : "返信対応"}
                  </td>
                  <td className="px-4 py-3">
                    {f.rating === "good" ? <Badge tone="green"><ThumbsUp className="h-3 w-3" /> Good</Badge> : <Badge tone="red"><ThumbsDown className="h-3 w-3" /> Bad</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-400">{f.comment || "—"}</td>
                  <td className="px-4 py-3 text-xs text-ink-400">{fmtDateTime(f.createdAt)}</td>
                </tr>
              ))}
              {state.feedbacks.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-ink-400">まだ評価がありません。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
