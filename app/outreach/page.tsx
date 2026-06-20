"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Send,
  ShieldX,
  Check,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Mail,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, GuideBanner, EmptyState } from "@/components/ui";
import { productTypeLabel, channelLabel, fmtDateTime } from "@/lib/utils";
import { templateMessage } from "@/lib/message";

type SendState =
  | { kind: "idle" }
  | { kind: "sent" }
  | { kind: "blocked"; reason: string };

export default function OutreachPage() {
  const { state, addActivity, sendActivity, addFeedback } = useStore();

  const candidates = useMemo(
    () => state.targets.filter((t) => t.status === "approved" || t.status === "pending"),
    [state.targets]
  );

  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.id ?? "");
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [source, setSource] = useState<"ai" | "template" | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendState, setSendState] = useState<SendState>({ kind: "idle" });
  const [feedbackDone, setFeedbackDone] = useState(false);

  const target = state.targets.find((t) => t.id === selectedId);
  const campaign = target ? state.campaigns.find((c) => c.id === target.campaignId) : undefined;
  const productType = campaign?.productType ?? "lifeline";

  async function generate() {
    if (!target) return;
    setLoading(true);
    setSendState({ kind: "idle" });
    setFeedbackDone(false);
    const payload = {
      companyName: target.companyName,
      storeName: target.storeName,
      contactName: target.contactName,
      productType,
      area: campaign?.area,
      variant,
    };
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSubject(data.subject);
      setBody(data.body);
      setSource(data.source);
    } catch {
      const tpl = templateMessage(payload);
      setSubject(tpl.subject);
      setBody(tpl.body);
      setSource("template");
    } finally {
      setLoading(false);
    }
  }

  function send() {
    if (!target || !subject || !body) return;
    const activity = addActivity({
      targetId: target.id,
      campaignId: target.campaignId,
      channel: "email",
      subject,
      body,
      variant,
    });
    const result = sendActivity(activity.id);
    if (result.ok) {
      setSendState({ kind: "sent" });
    } else {
      setSendState({ kind: "blocked", reason: result.reason || "除外リストと一致" });
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="アプローチ実行"
        description="AIが企業ごとにパーソナライズした営業文面を生成。送信直前に除外リストを最終照合し、該当先は物理的にブロックします。"
      />

      <GuideBanner tone="warn">
        AIが営業文面を作るよ✍️ 送信ボタンを押すと、その瞬間にもう一度除外リストを照合するんだ。
        もし契約中の店舗だったら<span className="font-semibold text-brand-300">物理的にブロック</span>するから、誤送信は起きないよ！
      </GuideBanner>

      {candidates.length === 0 && state.targets.every((t) => t.status !== "approved" && t.status !== "pending") ? (
        <EmptyState title="アプローチ可能なターゲットがありません" hint="「リスト管理」で企業を承認すると、ここで文面を作成できます。" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Left: target + controls */}
          <div className="space-y-4 lg:col-span-2">
            <div className="card p-4">
              <label className="label">対象企業を選択</label>
              <select className="input" value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setSubject(""); setBody(""); setSource(null); setSendState({ kind: "idle" }); }}>
                {candidates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.companyName}（{t.storeName}）
                  </option>
                ))}
              </select>

              {target && (
                <div className="mt-3 space-y-1 rounded-xl border border-ink-800 bg-ink-900/40 p-3 text-xs text-ink-300">
                  <div className="flex justify-between"><span className="text-ink-400">担当者</span><span>{target.contactName}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">メール</span><span>{target.contactEmail}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">商材</span><span>{productTypeLabel[productType]}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">スコア</span><span className="font-semibold text-ink-100">{target.score}</span></div>
                </div>
              )}

              <div className="mt-3">
                <label className="label">文面パターン（A/Bテスト）</label>
                <div className="flex gap-2">
                  {(["A", "B"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariant(v)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
                        variant === v ? "border-brand-500 bg-brand-500/15 text-brand-200" : "border-ink-700 bg-ink-900/40 text-ink-300"
                      }`}
                    >
                      パターン{v}
                      <span className="ml-1 font-normal text-ink-400">{v === "A" ? "課題提起" : "ベネフィット"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generate} disabled={loading || !target} className="btn-primary mt-3 w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "生成中…" : "AIで文面生成"}
              </button>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
                ANTHROPIC_API_KEY 設定時は Claude が生成。未設定でもテンプレートで動作します（無料）。
              </p>
            </div>
          </div>

          {/* Right: editor */}
          <div className="lg:col-span-3">
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-100">
                  <Mail className="h-4 w-4 text-brand-400" /> {channelLabel.email} 文面
                </h3>
                {source && (
                  <Badge tone={source === "ai" ? "brand" : "neutral"}>
                    {source === "ai" ? "Claude 生成" : "テンプレート生成"}
                  </Badge>
                )}
              </div>

              {!subject && !body ? (
                <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-700 text-center text-sm text-ink-400">
                  <Sparkles className="h-6 w-6 text-ink-500" />
                  左の「AIで文面生成」を押すと、ここに営業文面が表示されます。
                </div>
              ) : (
                <>
                  <label className="label">件名</label>
                  <input className="input mb-3" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  <label className="label">本文</label>
                  <textarea className="input min-h-[18rem] font-sans leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />

                  {/* Feedback */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-ink-400">この文面の評価：</span>
                    <button
                      disabled={feedbackDone}
                      onClick={() => { addFeedback({ targetType: "message", targetId: target!.id, rating: "good" }); setFeedbackDone(true); }}
                      className="btn-ghost px-2.5 py-1 text-xs disabled:opacity-50"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> Good
                    </button>
                    <button
                      disabled={feedbackDone}
                      onClick={() => { addFeedback({ targetType: "message", targetId: target!.id, rating: "bad" }); setFeedbackDone(true); }}
                      className="btn-ghost px-2.5 py-1 text-xs disabled:opacity-50"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" /> Bad
                    </button>
                    {feedbackDone && <span className="text-xs text-emerald-300">評価ありがとう！AIが学習するよ</span>}
                  </div>
                </>
              )}

              {/* Send result */}
              {sendState.kind === "sent" && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  <Check className="h-4 w-4" /> 送信しました。送信直前の除外チェックを通過しています。
                </div>
              )}
              {sendState.kind === "blocked" && (
                <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldX className="h-4 w-4" /> 送信を物理ブロックしました
                  </div>
                  <p className="mt-1 text-xs text-red-300/90">理由：{sendState.reason}（送信直前の最終照合で検知）</p>
                </div>
              )}

              <button
                onClick={send}
                disabled={!subject || !body || sendState.kind !== "idle"}
                className="btn-primary mt-3 w-full"
              >
                <Send className="h-4 w-4" /> 承認して送信（最終除外チェック）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent activities */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-ink-100">最近のアプローチ</h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-left text-xs text-ink-400">
                  <th className="px-4 py-3 font-medium">企業</th>
                  <th className="px-4 py-3 font-medium">件名</th>
                  <th className="px-4 py-3 font-medium">状態</th>
                  <th className="px-4 py-3 font-medium">日時</th>
                </tr>
              </thead>
              <tbody>
                {state.activities.slice(0, 8).map((a) => {
                  const t = state.targets.find((x) => x.id === a.targetId);
                  return (
                    <tr key={a.id} className="border-b border-ink-800/60 last:border-0">
                      <td className="px-4 py-3 text-ink-100">{t?.companyName ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-ink-300">{a.subject}</td>
                      <td className="px-4 py-3">
                        {a.status === "blocked" ? (
                          <Badge tone="red">ブロック</Badge>
                        ) : a.status === "replied" ? (
                          <Badge tone="yellow">返信あり</Badge>
                        ) : a.status === "opened" ? (
                          <Badge tone="blue">開封</Badge>
                        ) : a.status === "sent" ? (
                          <Badge tone="green">送信済</Badge>
                        ) : (
                          <Badge>{a.status}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-400">{fmtDateTime(a.sentAt || a.createdAt)}</td>
                    </tr>
                  );
                })}
                {state.activities.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-ink-400">まだアプローチはありません。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
