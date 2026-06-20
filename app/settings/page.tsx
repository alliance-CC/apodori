"use client";

import { useState } from "react";
import { Cloud, Sheet, Slack, Calendar, Bot, Check } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LightKun } from "@/components/brand/LightKun";
import { Badge, PageHeader, GuideBanner } from "@/components/ui";

export default function SettingsPage() {
  const [slack, setSlack] = useState(true);
  const [email, setEmail] = useState(true);
  const [daily, setDaily] = useState(true);
  const [rate, setRate] = useState(50);

  return (
    <div className="animate-fade-in">
      <PageHeader title="設定" description="ブランド・通知・API連携・権限を管理します。" />

      <GuideBanner>
        ブランドカラーや通知、外部サービスとの連携はここで設定できるよ⚙️ ぼくのイラストもちゃんと背景透過だよ！
      </GuideBanner>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Branding */}
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-100">ブランド設定</h3>

          <div className="space-y-4">
            <div>
              <p className="label">ロゴ（テキスト・常に高画質）</p>
              <div className="flex items-center gap-4 rounded-xl border border-ink-800 bg-ink-950/60 p-4">
                <Logo className="text-2xl" />
                <Logo variant="mark" className="h-9 w-9" />
              </div>
            </div>

            <div>
              <p className="label">イメージキャラクター「ライトくん」</p>
              <div className="flex items-center gap-4 rounded-xl border border-ink-800 bg-ink-950/60 p-4">
                <LightKun className="h-20 w-auto" />
                <p className="text-xs leading-relaxed text-ink-400">
                  アプリ内の案内人。<br />背景透過で、どの画面でも使えます。
                </p>
              </div>
            </div>

            <div>
              <p className="label">ブランドカラー（黒 × オレンジ）</p>
              <div className="flex flex-wrap gap-2">
                <Swatch color="#FF6A13" name="Brand 500" />
                <Swatch color="#F2570C" name="Brand 600" />
                <Swatch color="#FF8330" name="Brand 400" />
                <Swatch color="#1A1A20" name="Ink 800" />
                <Swatch color="#0B0B0E" name="Ink 950" />
              </div>
            </div>

            <p className="rounded-lg border border-ink-800 bg-ink-900/40 p-3 text-[11px] leading-relaxed text-ink-400">
              公式の画像へ差し替える場合は <code className="text-ink-200">/public/brand/</code> 内の
              <code className="text-ink-200"> lifeap-logo.svg</code> /
              <code className="text-ink-200"> light-kun.svg</code> を置き換えてください（コード変更不要・背景透過を維持）。
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Notifications */}
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-ink-100">通知設定</h3>
            <div className="space-y-3">
              <Toggle label="Slack 通知（商談獲得・要対応返信）" on={slack} set={setSlack} />
              <Toggle label="メール通知（商談確定・週次サマリー）" on={email} set={setEmail} />
              <Toggle label="日次サマリー（毎朝配信）" on={daily} set={setDaily} />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-ink-300">送信レート制限（1日あたり）</span>
                <span className="font-semibold text-brand-300">{rate} 件/日</span>
              </div>
              <input type="range" min={10} max={200} step={10} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-brand-500" />
            </div>
          </div>

          {/* Integrations */}
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-ink-100">API 連携</h3>
            <div className="space-y-2">
              <Integration icon={<Cloud className="h-4 w-4 text-sky-400" />} name="Salesforce" desc="既契約店舗のマスター同期" connected />
              <Integration icon={<Sheet className="h-4 w-4 text-emerald-400" />} name="Google Sheets" desc="補助除外リスト同期" connected />
              <Integration icon={<Slack className="h-4 w-4 text-violet-400" />} name="Slack" desc="通知・進捗共有" />
              <Integration icon={<Calendar className="h-4 w-4 text-rose-400" />} name="Google Calendar" desc="商談スケジュール管理" />
              <Integration icon={<Bot className="h-4 w-4 text-brand-400" />} name="Anthropic Claude" desc="ANTHROPIC_API_KEY で文面生成を有効化" envBased />
            </div>
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="card mt-4 p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink-100">ユーザー権限</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-left text-xs text-ink-400">
                <th className="px-3 py-2 font-medium">ロール</th>
                <th className="px-3 py-2 font-medium">権限</th>
              </tr>
            </thead>
            <tbody className="text-ink-200">
              <tr className="border-b border-ink-800/60"><td className="px-3 py-2"><Badge tone="brand">管理者</Badge></td><td className="px-3 py-2 text-xs text-ink-300">全機能アクセス可</td></tr>
              <tr className="border-b border-ink-800/60"><td className="px-3 py-2"><Badge tone="blue">営業担当</Badge></td><td className="px-3 py-2 text-xs text-ink-300">担当商談のみ閲覧・対応</td></tr>
              <tr><td className="px-3 py-2"><Badge>閲覧者</Badge></td><td className="px-3 py-2 text-xs text-ink-300">レポートのみ閲覧</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Swatch({ color, name }: { color: string; name: string }) {
  return (
    <div className="text-center">
      <div className="h-12 w-16 rounded-lg border border-ink-700" style={{ background: color }} />
      <p className="mt-1 text-[10px] text-ink-400">{name}</p>
    </div>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} className="flex w-full items-center justify-between rounded-xl border border-ink-800 bg-ink-900/40 px-3 py-2.5 text-left">
      <span className="text-sm text-ink-200">{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-brand-500" : "bg-ink-700"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

function Integration({
  icon,
  name,
  desc,
  connected,
  envBased,
}: {
  icon: React.ReactNode;
  name: string;
  desc: string;
  connected?: boolean;
  envBased?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/40 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-100">{name}</p>
        <p className="truncate text-xs text-ink-400">{desc}</p>
      </div>
      {connected ? (
        <Badge tone="green"><Check className="h-3 w-3" /> 接続済</Badge>
      ) : envBased ? (
        <Badge tone="yellow">環境変数</Badge>
      ) : (
        <Badge tone="neutral">未接続</Badge>
      )}
    </div>
  );
}
