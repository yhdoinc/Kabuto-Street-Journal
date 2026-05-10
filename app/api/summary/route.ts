import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      あなたは一流の投資戦略家です。以下の6名の最新の投資スタンスをシミュレーションし、
      現在の日本市場における「構造的勝ち組（商社、エネルギー、半導体、金融、電力）」への投資継続可否を分析してください。

      【対象者】
      1. ウォーレン・バフェット（聖地：長期・構造的価値）
      2. 田端慎太郎（ビジネスの本質・資本主義）
      3. 岐阜暴威（市場心理・逆張り指標）
      4. 桐谷広人（優待・配当・日本株の粘り）
      5. エミン・ユルマズ（グローバルマクロ・地政学）
      6. ジム・クレイマー（米国市場の動向・ボラティリティ）

      【出力フォーマット（厳守）】
      [BUFFETT] バフェットの見解（一言） [/BUFFETT]
      [LOCAL] 田端・岐阜・桐谷の日本勢の総括 [/LOCAL]
      [GLOBAL] エミン・ジムの海外/マクロ勢の総括 [/GLOBAL]
      [STRATEGY] あなた（軍師）としての最終的な投資判断。特に「商社・半導体」をどうすべきか [/STRATEGY]
      [QUOTE] 本多静六やバフェットの精神を反映した、今日の一言 [/QUOTE]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });

  } catch (error: any) {
    console.error("Summary API Error:", error);
    // 429エラー等の場合は、フロント側で「通信障害」として処理させるためのエラーレスポンス
    return NextResponse.json(
      { error: "API Quota Exceeded or Error", content: "【通信障害】市場のノイズが大きすぎます。石垣を積み、待機してください。" },
      { status: 429 }
    );
  }
}