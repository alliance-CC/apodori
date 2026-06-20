"use client";

import {
  MessageSquare,
  ArrowUpRight,
  Bot,
  Ban,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, GuideBanner } from "@/components/ui";
import { replyClassLabel, fmtDateTime, targetStatusLabel } from "@/lib/utils";

const classTone: Record<string, "green" | "yellow" | "red" | "blue"> = {
  interested: "green",
  scheduling: "yellow",
  ng: "red",
  considering: "blue",
};

export default function ActivitiesPage() {
  const { state } = useStore();

  const counts = {
    pending: state.targets.filter((t) => ["pending", "approved"].includes(t.status)).length,
    sent: state.targets.filter((t) => t.status === "sent").length,
    replied: state.targets.filter((t) => t.status === "replied").length,
    deal: state.targets.filter((t) => t.status === "deal").length,
    ng: state.targets.filter((t) => ["ng", "excluded"].includes(t.status)).length,
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="活動管理"
        description="アプローチ状況・返信対応・商談スケジュールを一元管理。返信はAIが分類し、初期対応まで自動化します。"
      />

      <GuideBanner>
        返信はAIが「興味あり / 日程調整 / お断り / 検討中」に自動で仕分けするよ📨 お断りは自動で除外リストへ追加。
        商談が確定したら、ちゃんと人間にバトンタッチするから安心してね。
      </GuideBanner>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <PipelineStat label="未送信" value={counts.pending} />
        <PipelineStat label="送信済" value={counts.sent} />
        <PipelineStat label="返信あり" value={counts.replied} accent />
        <PipelineStat label="商談" value={counts.deal} good />
        <PipelineStat label="NG/除外" value={counts.ng} />
      </div>

      {/* Replies */}
      <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-ink-100">
        <MessageSquare className="h-4 w-4 text-brand-400" /> 要対応の返信
      </h3>
      <div className="grid gap-3 lg:grid-cols-2">
        {state.replies.map((r) => {
          const t = state.targets.find((x) => x.id === r.targetId);
          return (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink-50">{t?.companyName}</p>
                  <p className="text-xs text-ink-400">{t?.contactName}・{fmtDateTime(r.createdAt)}</p>
                </div>
                <Badge tone={classTone[r.classification]}>{replyClassLabel[r.classification]}</Badge>
              </div>

              <blockquote className="mt-3 rounded-xl border-l-2 border-ink-600 bg-ink-900/40 px-3 py-2 text-xs leading-relaxed text-ink-200">
                {r.content}
              </blockquote>

              {r.aiResponse && (
                <div className="mt-3 rounded-xl border border-brand-500/20 bg-brand-500/[0.06] p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-brand-300">
                    <Bot className="h-3.5 w-3.5" /> AI初期対応（自動下書き）
                  </div>
                  <p className="text-xs leading-relaxed text-ink-200">{r.aiResponse}</p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {r.humanEscalated && (
                  <Badge tone="yellow"><ArrowUpRight className="h-3 w-3" /> 人間へエスカレーション</Badge>
                )}
                {r.autoExcluded && (
                  <Badge tone="red"><Ban className="h-3 w-3" /> 除外リストへ自動追加</Badge>
                )}
                <span className="text-ink-500">感情：{sentimentLabel(r.sentiment)}</span>
              </div>
            </div>
          );
        })}
        {state.replies.length === 0 && (
          <p className="text-sm text-ink-400">まだ返信はありません。</p>
        )}
      </div>

      {/* All activities table */}
      <h3 className="mb-3 mt-6 text-sm font-semibold text-ink-100">全アプローチ履歴</h3>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-left text-xs text-ink-400">
                <th className="px-4 py-3 font-medium">企業 / 店舗</th>
                <th className="px-4 py-3 font-medium">ステータス</th>
                <th className="px-4 py-3 font-medium">パターン</th>
                <th className="px-4 py-3 font-medium">送信日時</th>
                <th className="px-4 py-3 font-medium">開封 / 返信</th>
              </tr>
            </thead>
            <tbody>
              {state.activities.map((a) => {
                const t = state.targets.find((x) => x.id === a.targetId);
                return (
                  <tr key={a.id} className="border-b border-ink-800/60 last:border-0 hover:bg-ink-800/30">
                    <td className="px-4 py-3">
                      <div className="text-ink-100">{t?.companyName}</div>
                      <div className="text-xs text-ink-400">{t?.storeName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={a.status === "blocked" ? "red" : a.status === "replied" ? "yellow" : a.status === "opened" ? "blue" : "green"}>
                        {a.status === "blocked" ? "ブロック" : a.status === "replied" ? "返信あり" : a.status === "opened" ? "開封" : "送信済"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-300">{a.variant ? `パターン${a.variant}` : "—"}</td>
                    <td className="px-4 py-3 text-xs text-ink-400">{fmtDateTime(a.sentAt)}</td>
                    <td className="px-4 py-3 text-xs text-ink-400">
                      {a.openedAt ? "開封" : "—"} / {a.repliedAt ? "返信" : "—"}
                    </td>
                  </tr>
                );
              })}
              {state.activities.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-ink-400">履歴はまだありません。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PipelineStat({ label, value, accent, good }: { label: string; value: number; accent?: boolean; good?: boolean }) {
  return (
    <div className={`card p-4 ${accent ? "border-brand-500/30" : ""}`}>
      <p className="text-xs text-ink-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${good ? "text-emerald-300" : accent ? "text-brand-300" : "text-ink-50"}`}>{value}</p>
    </div>
  );
}

function sentimentLabel(s: string) {
  return { positive: "ポジティブ", neutral: "ニュートラル", negative: "ネガティブ" }[s] || s;
}
