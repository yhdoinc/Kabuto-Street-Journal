import { NextResponse } from "next/server";
// あなたの定義した最強の規律をロード
import { KABUTO_ANALYST_PROMPT } from "@/utils/prompts";

// 1日4回（6時間 = 21600秒）を基本のキャッシュ単位にする
export const revalidate = 21600;

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // GASのデータソースURL（タイムスタンプによるキャッシュバスター付き）
  const gasBaseUrl = "https://script.google.com/macros/s/AKfycbwZ-hfYtygrqlo5ukpaw4qRfpBo0xar8xH5SdhNTuK491vdNTXrxLCLU_vGRiW7iGUHIA/exec";
  const gasUrl = `${gasBaseUrl}?t=${Date.now()}`;

  // 1. 現在時刻を日本標準時で取得
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
    // 【新設】1.5. GASから市場データ（日経平均・S&P500・VIXなど）を裏側で取得
    let marketDataText = "（GASからのリアルタイム市場データ取得に失敗しました）";
    try {
      // サーバーサイドからGASへリクエスト（Next.jsのキャッシュを回避するため、あえてno-store、または短めのrevalidate）
      const gasRes = await fetch(gasUrl, { cache: "no-store" });
      if (gasRes.ok) {
        const resData = await gasRes.json();
        if (resData && resData[0]) {
          // Geminiが解釈しやすいように綺麗なJSON文字列にしてプロンプトに埋め込む
          marketDataText = JSON.stringify(resData[0], null, 2);
        }
      }
    } catch (gasError: any) {
      console.error("KSJ GAS Fetch Error:", gasError.message);
      marketDataText = `（GAS通信エラー: ${gasError.message}）`;
    }

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

    // 3. プロンプトの先頭に「システム時刻」と「GASから得た重要指標」を強制注入
    const instructionWithTime = `
【最優先：2026年のリアルタイム分析命令】
現在は ${jstDate} です。

【GASシステムから取得した最新の市場データ】
${marketDataText}
（※上記には日経平均、S&P500、VIX指数などの生データが含まれています。個人資産についてのデータも出ていますがこれにはけっして触れてはならない）

あなたの知識にある過去データではなく、必ずこの「現在時刻」と「最新の市場データ」を絶対的な起点として、
本日時点から24時間以内の最新ニュースや市場データを検索・引用して分析を記述せよ。
特にVIXの数値や日経・S&P500の相関から読み取れる市場の「潮目の変化」に注意を払うこと。

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
        tools: [
          {
            googleSearch: {},
          },
        ],
      }),
      // 土日はキャッシュを1日に延ばし、平日は6時間にする
      next: { revalidate: isWeekend ? 86400 : 21600 },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "分析失敗");

    // フロントエンドには分析結果と一緒に、GASから引っ張ってきた生データも一緒に返してやると親切
    return NextResponse.json({
      status: "Success",
      analysis: result.candidates[0].content.parts[0].text,
      rawMarketData: marketDataText !== "（GASからのリアルタイム市場データ取得に失敗しました）" ? JSON.parse(marketDataText) : null,
      lastUpdated: jstDate, 
    });

  } catch (error: any) {
    console.error("KSJ Critical Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}