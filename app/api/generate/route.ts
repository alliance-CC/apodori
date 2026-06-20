import { NextResponse } from "next/server";
import { templateMessage, type GenInput } from "@/lib/message";

export const runtime = "nodejs";

/**
 * 営業文面生成 API。
 * - ANTHROPIC_API_KEY が設定されていれば Claude で高品質な文面を生成。
 * - 未設定（=無料運用のデフォルト）の場合はテンプレート文面を返す。
 * いずれの場合も必ず {subject, body, source} を返す。
 */
export async function POST(req: Request) {
  let input: GenInput;
  try {
    input = (await req.json()) as GenInput;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!input?.companyName) {
    return NextResponse.json({ error: "companyName is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // フォールバック（無料・キー不要）
  if (!apiKey) {
    const tpl = templateMessage(input);
    return NextResponse.json({ ...tpl, source: "template" });
  }

  try {
    // 動的 import：キー未設定の通常運用では SDK を読み込まない
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

    const system = [
      "あなたは株式会社ライフアップの優秀なインサイドセールス担当です。",
      "不動産仲介会社・管理会社の店長や営業担当に向けて、新規入居者向けのライフライン（電気・ガス・インターネット）およびオプションサービスの取次提携を依頼する、丁寧で簡潔な日本語の営業メールを作成します。",
      "誇大な表現や過度な煽りは避け、相手の事務負担軽減と入居者満足の観点で価値を伝えます。",
      "出力は必ず JSON で {\"subject\": string, \"body\": string} のみ。前置き・後置きの説明は一切付けないこと。",
    ].join("\n");

    const userPrompt = [
      `対象企業: ${input.companyName}`,
      input.storeName ? `店舗名: ${input.storeName}` : "",
      input.contactName ? `担当者: ${input.contactName}` : "",
      `提案商材: ${input.productName || input.productType}`,
      input.productSummary ? `商材概要: ${input.productSummary}` : "",
      input.productPoints ? `訴求ポイント:\n${input.productPoints}` : "",
      input.area ? `エリア: ${input.area}` : "",
      `文面パターン: ${input.variant === "B" ? "ベネフィット訴求型" : "課題提起型"}`,
      input.senderName ? `差出人: ${input.senderName}` : "差出人: 株式会社ライフアップ 営業担当",
      "",
      "上記情報をもとに、パーソナライズした営業メールを JSON で生成してください。",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await client.messages.create({
      model,
      max_tokens: 1500,
      output_config: { effort: "medium" },
      system,
      messages: [{ role: "user", content: userPrompt }],
    } as any);

    const text = res.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    // JSON 抽出（コードフェンス等を除去）
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed.subject && parsed.body) {
          return NextResponse.json({
            subject: String(parsed.subject),
            body: String(parsed.body),
            source: "ai",
          });
        }
      } catch {
        /* fallthrough to template */
      }
    }
    // 解析できなければテンプレートにフォールバック
    const tpl = templateMessage(input);
    return NextResponse.json({ ...tpl, source: "template" });
  } catch (e: any) {
    // API エラー時も止めずにテンプレートで応答（安全側）
    const tpl = templateMessage(input);
    return NextResponse.json({
      ...tpl,
      source: "template",
      note: "AI生成に失敗したためテンプレートを表示しています",
    });
  }
}
