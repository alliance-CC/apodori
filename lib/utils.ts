import type { Exclusion, Target } from "./types";

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-3)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${fmtDate(iso)} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export function pct(n: number, d: number): string {
  if (!d) return "0%";
  return `${Math.round((n / d) * 1000) / 10}%`;
}

// 全角→半角の簡易正規化
function toHalfWidth(s: string): string {
  return s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0)
  );
}

/** 法人格・空白・記号を除去して法人名を正規化（表記ゆれ吸収） */
export function normalizeCompany(name?: string): string {
  if (!name) return "";
  let s = toHalfWidth(name).toLowerCase();
  s = s
    .replace(/株式会社|有限会社|合同会社|合資会社|合名会社/g, "")
    .replace(/\(株\)|（株）|㈱|\(有\)|（有）|㈲/g, "")
    .replace(/co\.?,?\s*ltd\.?|inc\.?|corp\.?|ltd\.?/g, "")
    .replace(/[\s　・,，.。\-―ー－_/／]/g, "");
  return s.trim();
}

/** 電話番号を数字のみへ正規化（ハイフン・市外局番の揺れ吸収） */
export function normalizePhone(phone?: string): string {
  if (!phone) return "";
  return toHalfWidth(phone).replace(/\D/g, "");
}

export function emailDomain(email?: string): string {
  if (!email || !email.includes("@")) return "";
  return email.split("@")[1].trim().toLowerCase();
}

export interface MatchResult {
  exclusion: Exclusion;
  field: "company" | "store" | "email" | "domain" | "phone" | "address";
}

/**
 * ターゲットが除外リストに該当するか判定（いずれか一致で除外）。
 * §0-3 の照合条件（法人名／店舗名／メール／ドメイン／電話／住所）に対応。
 */
export function findExclusion(
  target: Pick<
    Target,
    "companyName" | "storeName" | "contactEmail" | "url"
  > & { phone?: string; address?: string },
  exclusions: Exclusion[]
): MatchResult | null {
  const tCompany = normalizeCompany(target.companyName);
  const tStore = normalizeCompany(target.storeName);
  const tEmail = (target.contactEmail || "").trim().toLowerCase();
  const tDomain = emailDomain(target.contactEmail);
  const tPhone = normalizePhone((target as any).phone);
  const tAddress = (target as any).address as string | undefined;

  for (const ex of exclusions) {
    if (!ex.isActive) continue;

    if (tCompany && normalizeCompany(ex.companyName) === tCompany)
      return { exclusion: ex, field: "company" };

    if (tStore && ex.storeName && normalizeCompany(ex.storeName) === tStore)
      return { exclusion: ex, field: "store" };

    if (tEmail && ex.email && ex.email.trim().toLowerCase() === tEmail)
      return { exclusion: ex, field: "email" };

    const exDomain = ex.emailDomain || emailDomain(ex.email);
    if (tDomain && exDomain && exDomain.toLowerCase() === tDomain)
      return { exclusion: ex, field: "domain" };

    if (tPhone && ex.phone && normalizePhone(ex.phone) === tPhone)
      return { exclusion: ex, field: "phone" };

    if (
      tAddress &&
      ex.address &&
      (tAddress.includes(ex.address) || ex.address.includes(tAddress))
    )
      return { exclusion: ex, field: "address" };
  }
  return null;
}

export const exclusionTypeLabel: Record<string, string> = {
  contracted: "契約中",
  opted_out: "配信停止",
  ng_response: "NG返信",
  manual: "手動",
};

export const matchFieldLabel: Record<string, string> = {
  company: "法人名",
  store: "店舗名",
  email: "メール",
  domain: "ドメイン",
  phone: "電話番号",
  address: "住所",
};

export const targetStatusLabel: Record<string, string> = {
  pending: "未処理",
  excluded: "除外",
  approved: "承認済",
  sent: "送信済",
  replied: "返信あり",
  deal: "商談",
  ng: "NG",
};

export const campaignStatusLabel: Record<string, string> = {
  draft: "下書き",
  review: "確認中",
  running: "稼働中",
  paused: "停止中",
  done: "完了",
};

export const productTypeLabel: Record<string, string> = {
  lifeline: "ライフライン",
  option: "オプション",
  bundle: "セット",
};

export const channelLabel: Record<string, string> = {
  email: "メール",
  form: "フォーム",
  linkedin: "LinkedIn",
  phone: "電話",
};

export const replyClassLabel: Record<string, string> = {
  interested: "興味あり",
  scheduling: "日程調整",
  ng: "お断り",
  considering: "検討中",
};
