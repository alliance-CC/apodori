<div align="center">
  <img src="public/brand/lifeap-logo.svg" alt="LIFE AP" height="56" />

  # 営業AIエージェント（Sales AI Agent）

  **株式会社ライフアップ** ／ 不動産会社向けライフライン取次の新規アポ獲得を自律実行する AI 営業エージェント

  <em>黒 × オレンジ・ダークテーマ／案内人「ライトくん」が使い方をナビゲート</em>
</div>

---

## 概要

ターゲット企業リストを渡すだけで、AIエージェントが専属インサイドセールス担当として動き、**商談獲得までの業務を丸ごと自律実行**するサービスの管理ダッシュボードです。

まず**自社の営業活動**（不動産会社への新規アポ取り）に適用し、プロダクトを磨いてから外部提供へ展開する想定で設計されています。要件定義書（`営業AIエージェント要件定義書`）の機能マップ **F0〜F6** をひととおり実装しています。

> ⚠️ **最重要思想：誤送信ゼロ。** すでに契約中の不動産店舗には絶対にアプローチしないよう、**三重チェック（リスト生成時／文面生成前／送信直前）** と**物理ブロック**を実装しています。

## 実装済み機能（F0〜F6）

| コード | 機能 | 画面 | 主な内容 |
|------|------|------|---------|
| **F0** | 除外リスト管理【最優先】 | `/exclusions` | Salesforce / Google Sheets 同期（モック）、手動追加、CSV一括インポート、**除外チェック実行**、種別フィルタ、除外解除 |
| **F1** | リスト作成 | `/lists` | AIスコア付きターゲット一覧、除外照合・自動除外、承認フロー |
| — | キャンペーン管理 | `/campaigns` | エリア・商材別キャンペーン、稼働/停止、成果サマリー、新規作成 |
| **F2** | アプローチ実行 | `/outreach` | AI文面生成（A/B）、**送信直前の最終除外チェック＝物理ブロック**、Good/Bad評価 |
| **F3** | 活動管理 | `/activities` | ステータス・パイプライン、返信のAI自動分類、エスカレーション |
| **F4** | 活動分析 | `/analytics` | 送信/開封/返信/商談の推移、A/B比較、返信分類、改善提案 |
| **F5** | AIフィードバック学習 | `/feedback` | ワンクリック Good/Bad、学習レベル可視化、評価ログ |
| **F6** | 管理ダッシュボード | `/`, `/settings` | KPIサマリー、ブランド設定、通知、API連携、権限 |

各画面では、弊社イメージキャラクター **「ライトくん」** が案内人として使い方を説明します（右下に常駐）。

## 技術スタック（なるべく無料で開発・運用）

- **Next.js 14 (App Router) + TypeScript** — Vercel 無料枠にそのままデプロイ可能
- **Tailwind CSS** — 黒×オレンジのブランドテーマ（`tailwind.config.ts`）
- **Recharts** — 分析グラフ
- **データ層** — ブラウザの `localStorage` によるローカルファースト（**DB不要＝月額0円**）。シードデータ同梱。`lib/types.ts` は要件定義書 §11 のデータモデルに準拠しており、将来 Supabase 等へ差し替え可能
- **AI文面生成** — `@anthropic-ai/sdk`。`ANTHROPIC_API_KEY` 設定時は **Claude (`claude-opus-4-8`)** が生成、未設定でもテンプレート文面で動作（**キー不要・無料**）

> 外部接続（Salesforce / Sheets / Slack / Calendar）はデモではモック同期で動作します。実接続は将来対応のプレースホルダを `settings` と `.env.example` に用意しています。

## セットアップ

```bash
npm install
cp .env.example .env.local   # 任意（未設定でも動作）
npm run dev                  # http://localhost:3000
```

本番ビルド：

```bash
npm run build && npm run start
```

### 環境変数（すべて任意）

| 変数 | 用途 |
|------|------|
| `ANTHROPIC_API_KEY` | 設定すると Claude が営業文面を生成（未設定はテンプレート） |
| `ANTHROPIC_MODEL` | 既定 `claude-opus-4-8`。コスト重視なら `claude-haiku-4-5` 等に変更可 |

## ウェブで使う（無料デプロイ）

最も簡単な方法は **Vercel（無料枠）** へのデプロイです。

1. **PR をマージ**して、アプリ本体を `main` ブランチに取り込む
   （`main` は初期化用の空コミットのみのため、先にマージが必要です）
2. [vercel.com](https://vercel.com) に **GitHubアカウントで登録**（無料）
3. **Add New → Project** から `alliance-CC/apodori` をインポート
   （フレームワークは Next.js が自動検出されます。設定変更は不要）
4. （任意）**Environment Variables** に `ANTHROPIC_API_KEY` を追加すると、
   文面生成が Claude になります（未設定でもテンプレートで動作）
5. **Deploy** → `https://〇〇.vercel.app` の URL が発行され、スマホ・PCの
   ブラウザからそのまま利用できます（データはブラウザ内に保存・DB不要）

> PR をマージせずに試したい場合は、Vercel の **Production Branch** を
> `claude/dazzling-knuth-rq3c92` に設定すれば、そのブランチをデプロイできます。

### ローカルで試す

```bash
npm install
npm run dev   # http://localhost:3000
```

## ブランドアセットについて（重要）

同梱の会社ロゴ（LIFE AP）と案内人キャラクター（ライトくん）は、見本画像をもとに作成した**背景透過 SVG**です（`public/brand/`）。

### 公式画像へ差し替える（背景の自動透過つき）

公式の画像（白背景の PNG / JPG）を使う場合は、**背景を自動で透過**して差し替えるスクリプトを用意しています。

```bash
# 1) 公式画像を raw フォルダに置く
#    public/brand/raw/logo.png       … ロゴ
#    public/brand/raw/light-kun.png  … ライトくん
# 2) 背景透過＋自動配線
npm run brand:transparent
```

- 画像の四辺から「白い背景」だけをフラッドフィルで透過します（**目のハイライト等、キャラクター内部の白は穴になりません**）。
- 透過 PNG を `public/brand/` に出力し、`lib/brand.ts` のパスも自動更新 → 全画面に反映。
- 背景が白以外の画像は別途ご相談ください。

## ディレクトリ構成

```
app/                各画面（App Router）＋ /api/generate（文面生成API）
components/
  brand/            Logo / LightKun / Mascot（案内人）
  layout/           Sidebar / AppShell
  ui.tsx            共通UI（StatCard / Badge / GuideBanner 等）
lib/
  types.ts          ドメインモデル（要件定義書 §11 準拠）
  store.tsx         状態管理（localStorage 永続化）＋ 除外チェックエンジン
  seed.ts           デモ用シードデータ
  utils.ts          除外マッチング（法人名・電話の正規化）など
  message.ts        テンプレート文面生成（無料フォールバック）
  guide.ts          ライトくんのページ別ガイド文言
public/brand/       ブランド SVG（背景透過）
```

## 注意事項

- 本リポジトリは要件定義書の **Phase 1（MVP / 自社利用）** に相当する管理画面のデモ実装です。実際のメール送信・Salesforce 実連携・実 LLM 自律実行は将来フェーズで接続します。
- デモデータは画面右上の「デモをリセット」でいつでも初期化できます。

---

<div align="center">
  <sub>© 株式会社ライフアップ｜営業AIエージェント</sub>
</div>
