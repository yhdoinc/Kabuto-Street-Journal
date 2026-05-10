"use client";
import { useState, useEffect } from "react";

// 修正ポイント：{ lastUpdated }: any を追加して、外からのデータを受け取れるようにします
export default function Header({ lastUpdated }: any) {
  // 1. 変数名を data, setData で統一します
  const [data, setData] = useState({
    totalAssets: "Connecting...",
    principal: "---",
    ratio: "---",
    isPositive: true,
    startDate: "2023.05.25"
  });

  const futuraStyle = { fontFamily: '"futura-pt", sans-serif' };

  return (
    <header style={{ width: '100%', paddingTop: '40px', paddingBottom: '10px', borderBottom: '1px solid black' }}>
      {/* 上部：エディションと資産額 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'end', marginBottom: '15px' }}>
        <div style={{ ...futuraStyle, fontSize: '11px', fontWeight: 900, borderLeft: '4px solid black', paddingLeft: '8px' }}>
          JAPANESE EDITION
        </div>
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#666', fontWeight: 'bold' }}>
          What's News.
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
          {/* ここに更新時間を表示する場所を作ります */}
          <span style={{ ...futuraStyle, fontSize: '10px', color: '#666' }}>
            LAST UPDATED: {lastUpdated}
          </span>
        </div>
      </div>

      {/* メインロゴ */}
      <div style={{ textAlign: 'center', borderTop: '4px solid black', borderBottom: '1px solid black', padding: '25px 0', marginTop: '10px' }}>
        <h1 style={{ ...futuraStyle, fontSize: '95px', margin: 0, lineHeight: 0.8, fontWeight: 900, letterSpacing: '-0.05em' }}>
          <span style={{ fontSize: '20px', display: 'inline-block', letterSpacing: '0.4em', marginRight: '15px', fontWeight: 300, verticalAlign: 'middle' }}>THE</span>
          KABUTO STREET JOURNAL.
        </h1>
      </div>

      {/* 日付と開始日 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', ...futuraStyle, fontSize: '11px', fontWeight: 900 }}>
        <span>Sunday, March 1, 2026</span>
        <span>ESTABLISHED {data.startDate}</span>
      </div>
    </header>
  );
}