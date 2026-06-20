import type { AppState } from "./types";

// すべて固定日時。ハイドレーション差異を避けるため動的な now() は使わない。
export function initialState(): AppState {
  return {
    version: 1,
    lastSync: {
      salesforce: "2026-06-20T06:00:00.000Z",
      sheets: "2026-06-20T06:00:00.000Z",
    },
    exclusions: [
      ex("ex1", "株式会社ハウスメイト関東", "ハウスメイト 品川店", "info@housemate-kanto.co.jp", "03-1234-5678", "東京都品川区東品川2-1-1", "contracted", "salesforce", "契約中（電気・ガス取次）"),
      ex("ex2", "ニュートラル不動産株式会社", "ニュートラル 吉祥寺店", "contact@neutral-fudosan.jp", "0422-22-3344", "東京都武蔵野市吉祥寺本町1-2-3", "contracted", "salesforce", "契約中"),
      ex("ex3", "東京セントラル賃貸株式会社", undefined, "info@tokyo-central.co.jp", "03-5555-1212", "東京都千代田区神田1-1", "contracted", "salesforce", "契約中（インターネット取次）"),
      ex("ex4", "株式会社アップルホーム", "アップルホーム 大宮店", "office@applehome.jp", "048-600-7788", "埼玉県さいたま市大宮区桜木町1-7", "contracted", "sheets", "契約中（補助リスト由来）"),
      ex("ex5", "ベイサイド不動産株式会社", "ベイサイド みなとみらい店", "info@bayside-estate.jp", "045-900-0001", "神奈川県横浜市西区みなとみらい2-2", "opted_out", "system", "配信停止リンクをクリック"),
      ex("ex6", "オールハウス管理株式会社", undefined, "support@allhouse-kanri.co.jp", "03-7777-8888", "東京都新宿区西新宿6-5", "contracted", "salesforce", "契約中"),
      ex("ex7", "株式会社メガリアルティ", "メガリアルティ 立川店", "info@mega-realty.jp", "042-500-3210", "東京都立川市曙町2-3", "ng_response", "system", "「今後連絡不要」との返信"),
      ex("ex8", "パークサイド不動産株式会社", "パークサイド 浦和店", "info@parkside-fudosan.jp", "048-800-2200", "埼玉県さいたま市浦和区高砂3-1", "contracted", "sheets", "契約中（補助リスト由来）"),
      ex("ex9", "株式会社さくらリフォーム", undefined, "info@sakura-reform.jp", "06-1111-2222", "大阪府大阪市北区梅田1-1", "manual", "manual", "競合のため手動除外"),
    ],
    campaigns: [
      cp("c1", "渋谷・新宿エリア 新規開拓（ライフライン）", "running", "lifeline", "東京都（渋谷区・新宿区）", "賃貸仲介を主とする店舗 / 従業員5〜30名"),
      cp("c2", "横浜エリア オプション提案", "running", "bundle", "神奈川県（横浜市）", "管理戸数500戸以上の管理会社"),
      cp("c3", "埼玉北部 セット提案", "review", "option", "埼玉県（さいたま市・川越市）", "新築仲介に強い地場店舗"),
    ],
    targets: [
      tg("t1", "c1", "株式会社みらい不動産", "みらい不動産 渋谷店", "tanaka@mirai-estate.jp", "田中 健一", "deal", 94, "渋谷エリアで賃貸仲介に注力。新生活サポートのオプション提案に前向きな反応。担当の田中店長がライフライン取次に関心。"),
      tg("t2", "c1", "さくら住宅販売株式会社", "さくらハウス 新宿店", "info@sakura-housing.jp", "佐藤 美咲", "replied", 88, "新宿三丁目の駅近店舗。単身者向け物件が中心で入居者へのライフライン案内ニーズが高い。"),
      tg("t3", "c1", "グリーンエステート株式会社", "グリーン不動産 池袋店", "kobayashi@green-estate.jp", "小林 大輔", "sent", 81, "ファミリー向け賃貸が強み。WEBサイトに『新生活応援』ページあり、提携余地大。"),
      tg("t4", "c1", "株式会社アーバンリビング", "アーバン中目黒", "contact@urban-living.jp", "鈴木 翔", "sent", 77, "デザイナーズ物件中心。富裕層入居者向けの高単価オプションが見込める。"),
      tg("t5", "c1", "株式会社ハウスメイト関東", "ハウスメイト 品川店", "info@housemate-kanto.co.jp", "山本 隆", "excluded", 0, "※既契約のため自動除外。"),
      tg("t6", "c1", "ニュートラル不動産株式会社", "ニュートラル 吉祥寺店", "contact@neutral-fudosan.jp", "中村 彩", "excluded", 0, "※既契約のため自動除外。"),
      tg("t7", "c2", "株式会社ライフホームズ", "ライフホームズ 横浜本店", "info@life-homes.jp", "加藤 直樹", "approved", 90, "横浜市内に5店舗展開する管理会社。管理戸数約1,200戸でライフライン一括取次の親和性が高い。"),
      tg("t8", "c2", "すまいるエステート株式会社", "すまいる 横浜西口店", "info@smile-estate.jp", "渡辺 七海", "replied", 85, "学生向け賃貸に強み。繁忙期前の提携で来期入居分の取次が期待できる。"),
      tg("t9", "c2", "ベイサイド不動産株式会社", "ベイサイド みなとみらい店", "info@bayside-estate.jp", "高橋 亮", "ng", 0, "※配信停止のため除外。"),
      tg("t10", "c2", "株式会社リバーサイド住販", "リバーサイド 関内店", "info@riverside-jutaku.jp", "伊藤 香織", "pending", 72, "投資用区分が中心。オーナー経由での入居者案内ルートを検討中。"),
      tg("t11", "c3", "のぞみハウジング株式会社", "のぞみ 大宮店", "info@nozomi-housing.jp", "斎藤 拓也", "approved", 83, "さいたま市北部で新築仲介に強い。引越し時のライフライン一括手続き需要が大きい。"),
      tg("t12", "c3", "フロンティア不動産株式会社", "フロンティア 川越店", "info@frontier-fudosan.jp", "松本 由美", "sent", 79, "川越エリアの地場大手。地域密着で入居者との関係が深く取次成約率が見込める。"),
      tg("t13", "c3", "株式会社アップルホーム", "アップルホーム 大宮店", "office@applehome.jp", "井上 誠", "excluded", 0, "※既契約のため自動除外（Sheets由来）。"),
      tg("t14", "c3", "株式会社グッドルーム埼玉", "グッドルーム 川口店", "info@goodroom-saitama.jp", "木村 沙織", "pending", 68, "リノベ賃貸が中心。若年層入居者向けのインターネット取次が有望。"),
    ],
    activities: [
      ac("a1", "t1", "c1", "email", "【新生活サポート】入居者様向けライフラインご案内のご提案", "sent", "A", "2026-06-15T01:00:00.000Z", "2026-06-15T03:20:00.000Z", "2026-06-16T02:10:00.000Z"),
      ac("a2", "t2", "c1", "email", "入居者様の電気・ガス・ネット手続きを一括代行するご提案", "sent", "A", "2026-06-16T01:00:00.000Z", "2026-06-16T04:00:00.000Z", "2026-06-17T05:30:00.000Z"),
      ac("a3", "t3", "c1", "email", "新生活応援｜ライフライン取次のご提携について", "opened", "B", "2026-06-18T01:00:00.000Z", "2026-06-18T07:40:00.000Z", undefined),
      ac("a4", "t4", "c1", "email", "デザイナーズ入居者様向け 高付加価値オプションのご案内", "sent", "B", "2026-06-19T01:00:00.000Z", undefined, undefined),
      ac("a5", "t8", "c2", "email", "学生向け繁忙期に向けたライフライン一括取次のご提案", "replied", "A", "2026-06-17T01:00:00.000Z", "2026-06-17T02:30:00.000Z", "2026-06-18T01:15:00.000Z"),
      ac("a6", "t12", "c3", "email", "川越エリア｜入居者様の引越し手続き一括代行のご提案", "sent", "A", "2026-06-19T02:00:00.000Z", undefined, undefined),
    ],
    replies: [
      rp("r1", "a2", "t2", "ご提案ありがとうございます。入居者様向けの案内に興味があります。一度オンラインでお話を伺えますか。", "positive", "interested", false, "ご返信ありがとうございます。ぜひ詳細をご説明させてください。来週のご都合のよい日時を3つほど頂けますか。", true),
      rp("r2", "a5", "t8", "繁忙期前に話を聞きたいです。今週金曜の午後は空いていますか？", "positive", "scheduling", false, "金曜午後で承知しました。14時/ 15時 のいずれかでカレンダー招待をお送りします。", true),
      rp("r3", "a1", "t1", "提携の方向で進めたいです。契約書のドラフトを送ってください。", "positive", "interested", false, undefined, true),
    ],
    deals: [
      dl("d1", "t1", "株式会社みらい不動産", "2026-06-23T05:00:00.000Z", "田中（自社）", "scheduled"),
      dl("d2", "t2", "さくら住宅販売株式会社", "2026-06-25T02:00:00.000Z", "佐藤（自社）", "scheduled"),
    ],
    feedbacks: [
      fb("f1", "message", "a1", "good", "店長の関心ポイントを的確に押さえた文面で good。"),
      fb("f2", "message", "a4", "bad", "高付加価値の訴求が抽象的。具体的な金額メリットを入れたい。"),
      fb("f3", "list", "t10", "bad", "投資用中心で入居者接点が弱く、優先度は低め。"),
      fb("f4", "message", "a2", "good"),
    ],
    syncLogs: [
      sl("s1", "salesforce", "2026-06-20T06:00:12.000Z", 412, 3, 11, 0, "success"),
      sl("s2", "sheets", "2026-06-20T06:00:20.000Z", 58, 1, 2, 0, "success"),
      sl("s3", "salesforce", "2026-06-19T06:00:09.000Z", 409, 1, 6, 0, "success"),
    ],
    kpi: [
      k("06/07", 18, 9, 2, 0),
      k("06/08", 22, 12, 3, 0),
      k("06/09", 0, 0, 0, 0),
      k("06/10", 26, 14, 4, 1),
      k("06/11", 31, 18, 5, 0),
      k("06/12", 28, 15, 4, 1),
      k("06/13", 12, 6, 1, 0),
      k("06/14", 0, 0, 0, 0),
      k("06/15", 34, 21, 6, 1),
      k("06/16", 38, 24, 7, 1),
      k("06/17", 41, 26, 8, 2),
      k("06/18", 36, 22, 6, 1),
      k("06/19", 44, 28, 9, 1),
      k("06/20", 19, 11, 4, 1),
    ],
  };
}

// ---- builders ----
function ex(
  id: string,
  companyName: string,
  storeName: string | undefined,
  email: string,
  phone: string,
  address: string,
  type: any,
  source: any,
  reason: string
) {
  return {
    id,
    companyName,
    storeName,
    email,
    emailDomain: email.split("@")[1],
    phone,
    address,
    type,
    source,
    reason,
    addedBy: source === "manual" ? "admin" : "system",
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-20T06:00:00.000Z",
  };
}
function cp(id: string, name: string, status: any, productType: any, area: string, targetCriteria: string) {
  return { id, name, status, productType, area, targetCriteria, createdAt: "2026-06-05T00:00:00.000Z" };
}
function tg(
  id: string,
  campaignId: string,
  companyName: string,
  storeName: string,
  contactEmail: string,
  contactName: string,
  status: any,
  score: number,
  researchSummary: string
) {
  return {
    id,
    campaignId,
    companyName,
    storeName,
    url: "https://example.com/" + id,
    contactEmail,
    contactName,
    industry: "不動産仲介・管理",
    size: "5〜50名",
    prefecture: "—",
    status,
    score,
    researchSummary,
    exclusionCheckAt: "2026-06-14T00:00:00.000Z",
    excludedReason: status === "excluded" ? "既契約店舗（contracted）と一致" : status === "ng" ? "配信停止（opted_out）" : undefined,
    createdAt: "2026-06-10T00:00:00.000Z",
  };
}
function ac(
  id: string,
  targetId: string,
  campaignId: string,
  channel: any,
  subject: string,
  status: any,
  variant: any,
  sentAt?: string,
  openedAt?: string,
  repliedAt?: string
) {
  return {
    id,
    targetId,
    campaignId,
    channel,
    subject,
    body: "",
    status,
    variant,
    sentAt,
    openedAt,
    repliedAt,
    exclusionVerifiedAt: sentAt,
    createdAt: sentAt || "2026-06-18T00:00:00.000Z",
  };
}
function rp(
  id: string,
  activityId: string,
  targetId: string,
  content: string,
  sentiment: any,
  classification: any,
  autoExcluded: boolean,
  aiResponse: string | undefined,
  humanEscalated: boolean
) {
  return {
    id,
    activityId,
    targetId,
    content,
    sentiment,
    classification,
    autoExcluded,
    aiResponse,
    humanEscalated,
    createdAt: "2026-06-18T02:00:00.000Z",
  };
}
function dl(id: string, targetId: string, companyName: string, scheduledAt: string, assignee: string, status: any) {
  return { id, targetId, companyName, scheduledAt, assignee, status, createdAt: "2026-06-18T00:00:00.000Z" };
}
function fb(id: string, targetType: any, targetId: string, rating: any, comment?: string) {
  return { id, targetType, targetId, rating, comment, createdAt: "2026-06-18T00:00:00.000Z" };
}
function sl(id: string, source: any, ranAt: string, fetched: number, added: number, updated: number, errors: number, status: any) {
  return { id, source, ranAt, fetched, added, updated, errors, status };
}
function k(date: string, sent: number, opened: number, replied: number, deals: number) {
  return { date, sent, opened, replied, deals };
}
