import { NextResponse } from "next/server";
// あなたの定義した最強の規律をロード
import { KABUTO_ANALYST_PROMPT } from "@/utils/prompts";

// 1日4回（6時間 = 21600秒）を基本のキャッシュ単位にする
export const revalidate = 21600;

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. 現在時刻を日本標準時で取得（AIに「今」を教えるための最重要ステップ）
  const now = new Date();
  const jstDate = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Asia/Tokyo",
  }).format(now);

  const day = now.getDay(); // 0:日, 6:土
  const hour = now.getHours();

  // 土曜の正午から月曜の朝8時までは「週末モード」
  const isWeekend = (day === 6 && hour >= 12) || day === 0 || (day === 1 && hour < 8);

  try {
    // 2. 使えるモデルをリストから自動取得
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );
    const listData = await listRes.json();

    if (!listRes.ok) throw new Error("APIキーの権限エラーです");

    const model = listData.models.find((m: any) =>
      m.supportedGenerationMethods.includes("generateContent")
    );
    if (!model) throw new Error("使用可能なモデルが見つかりません");

    const url = `https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${apiKey}`;

    // 3. プロンプトの先頭に「システム時刻」を強制注入する
    // これにより、AIが過去の日付（2024年など）を捏造するのを防ぐ
    const instructionWithTime = `
【最優先：2026年のリアルタイム分析命令】
現在は ${jstDate} です。
あなたの知識にある過去データではなく、必ずこの「現在時刻」を起点として、
本日時点から24時間以内の最新ニュースや市場データを検索・引用して分析を記述せよ。
冒頭の日付表記も必ずこの時刻をベースにすること。また、日経平均株価や為替を引用する際も、同様に24時間以内のデータをもとにすること。

${KABUTO_ANALYST_PROMPT}
${isWeekend ? "\n\n現在は市場休場日のため、週明けの展望を重点的に述べてください。" : ""}
`.trim();

    // 4. Geminiに分析を依頼
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: instructionWithTime }],
          },
        ],
      }),
      // 土日はキャッシュを1日に延ばし、平日は6時間にする
      next: { revalidate: isWeekend ? 86400 : 21600 },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "分析失敗");

    return NextResponse.json({
      status: "Success",
      analysis: result.candidates[0].content.parts[0].text,
      lastUpdated: jstDate, // システム側の時刻も返却
    });

  } catch (error: any) {
    console.error("KSJ Critical Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}