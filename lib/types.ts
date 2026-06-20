// ===== 営業AIエージェント ドメインモデル =====
// 要件定義書 §11 データモデルに準拠（ローカルデモ用に型を整理）

export type ExclusionType =
  | "contracted" // 現在契約中の不動産店舗
  | "opted_out" // 配信停止リンクをクリック
  | "ng_response" // 「不要」等の返信
  | "manual"; // 管理者が手動追加

export type ExclusionSource = "salesforce" | "sheets" | "manual" | "system";

export interface Exclusion {
  id: string;
  companyName: string;
  storeName?: string;
  email?: string;
  emailDomain?: string;
  phone?: string;
  address?: string;
  type: ExclusionType;
  source: ExclusionSource;
  reason?: string;
  addedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TargetStatus =
  | "pending"
  | "excluded"
  | "approved"
  | "sent"
  | "replied"
  | "deal"
  | "ng";

export interface Target {
  id: string;
  campaignId: string;
  companyName: string;
  storeName?: string;
  url?: string;
  contactEmail?: string;
  contactName?: string;
  industry?: string;
  size?: string;
  prefecture?: string;
  status: TargetStatus;
  score: number;
  researchSummary?: string;
  exclusionCheckAt?: string;
  excludedReason?: string;
  createdAt: string;
}

export type CampaignStatus = "draft" | "review" | "running" | "paused" | "done";
export type ProductType = "lifeline" | "option" | "bundle";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  productType: ProductType;
  area: string;
  targetCriteria: string;
  createdAt: string;
}

export type Channel = "email" | "form" | "linkedin" | "phone";
export type ActivityStatus = "queued" | "sent" | "opened" | "replied" | "blocked";

export interface Activity {
  id: string;
  targetId: string;
  campaignId: string;
  channel: Channel;
  subject?: string;
  body?: string;
  status: ActivityStatus;
  variant?: "A" | "B";
  sentAt?: string;
  openedAt?: string;
  repliedAt?: string;
  exclusionVerifiedAt?: string;
  blockedReason?: string;
  createdAt: string;
}

export type ReplyClass = "interested" | "scheduling" | "ng" | "considering";

export interface Reply {
  id: string;
  activityId: string;
  targetId: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  classification: ReplyClass;
  autoExcluded: boolean;
  aiResponse?: string;
  humanEscalated: boolean;
  createdAt: string;
}

export interface Deal {
  id: string;
  targetId: string;
  companyName: string;
  scheduledAt: string;
  assignee?: string;
  status: "scheduled" | "done" | "lost";
  createdAt: string;
}

export type FeedbackTargetType = "message" | "list" | "reply";

export interface Feedback {
  id: string;
  targetType: FeedbackTargetType;
  targetId: string;
  rating: "good" | "bad";
  comment?: string;
  createdAt: string;
}

export interface SyncLog {
  id: string;
  source: "salesforce" | "sheets";
  ranAt: string;
  fetched: number;
  added: number;
  updated: number;
  errors: number;
  status: "success" | "error";
}

export interface DailyKpi {
  date: string; // MM/DD
  sent: number;
  opened: number;
  replied: number;
  deals: number;
}

export interface AppState {
  version: number;
  exclusions: Exclusion[];
  campaigns: Campaign[];
  targets: Target[];
  activities: Activity[];
  replies: Reply[];
  deals: Deal[];
  feedbacks: Feedback[];
  syncLogs: SyncLog[];
  kpi: DailyKpi[];
  lastSync: { salesforce?: string; sheets?: string };
}
