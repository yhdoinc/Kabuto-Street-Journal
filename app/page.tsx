"use client";
import { useState, useEffect, useCallback } from "react";
import Header from './components/Header';
import MarketWatch from './components/MarketWatch';
import AiReport from './components/AiReport';
import AssetStatus from './components/AssetStatus';

// --- 道具箱から格言をインポート ---
import { RAW_QUOTES } from "@/utils/quotes"; 

export default function Home() {
  // --- 状態管理 ---
  const [report, setReport] = useState("インテリジェンス待機中...");
  const [lastUpdated, setLastUpdated] = useState("---");
  const [data, setData] = useState({
    totalAssets: "Connecting...",
    principal: "---",
    ratio: "---",
    isPositive: true,
    market: []
  });

  // --- AIレポート取得ロジック ---
  const getAiReport = useCallback(async (force = false) => {
    const CACHE_KEY = "ksj_report_cache";
    const LAST_FETCH_KEY = "ksj_last_fetch_time";
    const COOL_DOWN_KEY = "ksj_cooldown_until"; 
    const ONE_HOUR = 60 * 60 * 1000;

    const now = Date.now();
    const lastFetch = Number(localStorage.getItem(LAST_FETCH_KEY) || 0);
    const coolDownUntil = Number(localStorage.getItem(COOL_DOWN_KEY) || 0);

    // 1. 強制更新(force)でない場合のみ、制限時間をチェック
    //if (!force && now < coolDownUntil) {
    //  setReport(localStorage.getItem(CACHE_KEY) || "現在、Geminiが休息中です...");
    //  return;
    //}

    // 2. 通常のキャッシュ（1時間）チェック
    if (!force && (now - lastFetch < ONE_HOUR)) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && !cached.includes("通信制限中")) { // エラー文言がキャッシュされてる場合は無視
        setReport(cached);
        return;
      }
    }

    try {
      setReport("市場のデータを解析中...（通信中）");
      // キャッシュを避けるためにタイムスタンプを付与
      const res = await fetch(`/api/analyze?t=${now}`);
      const resData = await res.json();

// 1. resData.content から resData.analysis に変更！
      if (res.ok && resData.analysis) {
        // 成功時：キャッシュしてクールダウンをクリア
        const [text, author] = RAW_QUOTES[Math.floor(Math.random() * RAW_QUOTES.length)];
        
        // 2. ここも resData.analysis に変更！
        const finalReport = `「${text}」\n—— ${author}\n\n===================================\n\n${resData.analysis}`;

        setReport(finalReport);
        localStorage.setItem(CACHE_KEY, finalReport);
        localStorage.setItem(LAST_FETCH_KEY, now.toString());
        localStorage.removeItem(COOL_DOWN_KEY); 
      } else if (res.status === 429) {
        // 429時：現在時刻から15分後までを「ロック」する
        const retryAfter = now + (15 * 60 * 1000); 
        const coolDownMsg = "【通信制限中】Geminiが休息を求めている。15分ほど待機せよ。";
        
        setReport(coolDownMsg);
        localStorage.setItem(CACHE_KEY, coolDownMsg);
        localStorage.setItem(COOL_DOWN_KEY, retryAfter.toString());
      } else {
        throw new Error(resData.error || "Unknown Error");
      }
    } catch (e) {
      console.error(e);
      setReport("接続エラーが発生しました。サーバーのログを確認してください。");
    }
  }, []);

  // --- 資産データ取得 & レポート初回実行 ---
  useEffect(() => {
    async function fetchAssets() {
      try {
        const baseUrl = "https://script.google.com/macros/s/AKfycbwZ-hfYtygrqlo5ukpaw4qRfpBo0xar8xH5SdhNTuK491vdNTXrxLCLU_vGRiW7iGUHIA/exec";
        const response = await fetch(`${baseUrl}?t=${Date.now()}`);
        const resData = await response.json();
        
        if (resData && resData[0]) {
          setData(resData[0]);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (e) {
        setData(prev => ({ ...prev, totalAssets: "OFFLINE" }));
        setLastUpdated("ERR");
      }
    }

    fetchAssets();
    // 初回は強制的に(true)取得しにいく
    getAiReport(true); 
  }, [getAiReport]); 

  // --- レイアウト ---
  return (
    <div style={{ width: '100%', backgroundColor: 'white', minHeight: '100vh', color: 'black' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
<Header {...({ lastUpdated } as any)} />
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 3fr 1.2fr', 
          gap: '30px',
          borderTop: '2px solid black',
          paddingTop: '20px',
          marginTop: '20px'
        }}>
          <MarketWatch market={data.market} lastUpdated={lastUpdated} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <AiReport content={report} />
          </div>
          <AssetStatus data={data} />
        </div>
      </main>
    </div>
  );
}