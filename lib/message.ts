import type { ProductType } from "./types";

export interface GenInput {
  companyName: string;
  storeName?: string;
  contactName?: string;
  productType: ProductType;
  area?: string;
  variant?: "A" | "B";
  senderName?: string;
}

export interface GenOutput {
  subject: string;
  body: string;
}

const productLabel: Record<ProductType, string> = {
  lifeline: "電気・ガス・インターネット等のライフライン",
  option: "新生活オプションサービス",
  bundle: "ライフライン＋オプションのセット",
};

const productBenefit: Record<ProductType, string> = {
  lifeline:
    "入居者様の電気・ガス・インターネットのお申し込みを当社が一括で代行し、御社の事務負担をかけずに入居後の手続きをスムーズにします",
  option:
    "新生活に必要なオプションサービスをまとめてご案内し、入居者様の満足度向上と御社の付加価値提案を支援します",
  bundle:
    "ライフラインとオプションを一括でご案内し、入居者様の手続きを最小化しながら御社に紹介手数料をご還元します",
};

/**
 * 無料で動作するテンプレートベースの文面生成。
 * ANTHROPIC_API_KEY が未設定でも常にこの文面が使えるフォールバック。
 */
export function templateMessage(input: GenInput): GenOutput {
  const sender = input.senderName || "株式会社ライフアップ 営業担当";
  const company = input.companyName;
  const person = input.contactName ? `${input.contactName} 様` : "ご担当者様";
  const store = input.storeName ? `（${input.storeName}）` : "";
  const variant = input.variant || "A";

  if (variant === "A") {
    // 課題提起型
    const subject = `【新生活サポート】入居者様向け${
      input.productType === "option" ? "オプション" : "ライフライン"
    }ご案内のご提案`;
    const body = [
      `${company}${store}`,
      `${person}`,
      "",
      `突然のご連絡失礼いたします。${sender}と申します。`,
      "",
      `新規ご入居者様への電気・ガス・インターネット等のお手続きは、繁忙期ほど御社の事務ご負担が大きくなりがちかと存じます。`,
      "",
      `当社では、${productBenefit[input.productType]}。`,
      "御社にご負担をおかけすることなく、入居者様の新生活開始をサポートいたします。",
      "",
      input.area ? `${input.area}エリアでの実績もございます。` : "",
      "一度オンラインで15分ほど、御社の運用に合わせたご提案をご説明させていただけないでしょうか。",
      "",
      "ご多忙のところ恐れ入りますが、ご検討のほどよろしくお願い申し上げます。",
      "",
      `─────────────`,
      sender,
      `株式会社ライフアップ`,
      `─────────────`,
    ]
      .filter((l) => l !== "")
      .join("\n");
    return { subject, body };
  }

  // variant B: ベネフィット型
  const subject = `${company}様へ｜入居者様の${productLabel[input.productType]}手続きを一括代行するご提案`;
  const body = [
    `${company}${store}`,
    `${person}`,
    "",
    `はじめてご連絡いたします。${sender}でございます。`,
    "",
    `${company}様の入居者様に対し、${productBenefit[input.productType]}サービスをご提案できればと存じます。`,
    "",
    "■ ご提携のメリット",
    "・入居者様の面倒な開通手続きをまとめて代行（御社の工数ゼロ）",
    "・ご紹介実績に応じた手数料を御社に還元",
    "・新生活サポートによる入居者様満足度の向上",
    "",
    input.area ? `${input.area}を中心に対応しております。` : "",
    "まずは資料のご送付、もしくは短時間のオンライン面談で詳細をご説明させていただけますと幸いです。",
    "",
    "ご検討のほど、何卒よろしくお願い申し上げます。",
    "",
    `─────────────`,
    sender,
    `株式会社ライフアップ`,
    `─────────────`,
  ]
    .filter((l) => l !== "")
    .join("\n");
  return { subject, body };
}
