'use client';

import React, { useState, useEffect } from 'react';

interface Stock {
  date: string;
  code: string;
  name: string;
  time: string;
  isWatch: boolean;
  week: string;
  market: string;
}

export default function EarningsSchedule() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [activeTab, setActiveTab] = useState<'thisWeek' | 'nextWeek'>('thisWeek');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbxleBmiGw3BcL3UW_jxi5lPCve5TmPtbNrK9j8vUZAgDiHVrHA0RvhDB-6sGHw6AacZsA/exec';
    
    console.log("🚀 決算カレンダーシステム、通信開始...");

    fetch(GAS_URL, { method: 'GET' })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(rawData => {
        console.log("🎯 GASから届いた生のデータ構造:", rawData);
        
        if (Array.isArray(rawData)) {
          const cleanedData = rawData.map((item: any) => {
            let date = "日付未定"; 
            let code = "----";
            let name = "不明な銘柄";
            let time = "15:00"; 
            let isWatch = false;
            let week = "this";
            let market = "JP";

            Object.keys(item).forEach(key => {
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes('code') || lowerKey.includes('コード')) code = String(item[key]);
              if (lowerKey.includes('備考') || lowerKey.includes('name') || lowerKey.includes('銘柄名')) name = String(item[key]);
              if (lowerKey.includes('market') || lowerKey.includes('市場')) {
                market = String(item[key]).toUpperCase();
                if (market === 'US') time = "取引時間後";
              }
              if (lowerKey.includes('iswatch') || lowerKey.includes('watch') || lowerKey.includes('監視')) {
                isWatch = item[key] === true || String(item[key]).toUpperCase() === 'TRUE';
              }
              if (lowerKey.includes('date') || lowerKey.includes('日付') || lowerKey.includes('決算日') || lowerKey.includes('予定')) {
                if (item[key]) date = String(item[key]);
              }
              if (lowerKey.includes('week') || lowerKey.includes('週')) {
                if (item[key]) week = String(item[key]).toLowerCase();
              }
            });

            return { date, code, name, time, isWatch, week, market };
          });

          // 📊 【追加：冷徹な日付順ソートロジック】
          // 5/20 などの文字列を一時的に2026年のシリアル値に直して昇順ソートをかけます
          cleanedData.sort((a, b) => {
            const parseDate = (dStr: string) => {
              const parts = dStr.split('/');
              if (parts.length === 2) {
                // 2026年固定でミリ秒に変換
                return new Date(2026, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10)).getTime();
              }
              return Infinity; // 日付未定やバグデータは強制的に最下位へ追放
            };
            return parseDate(a.date) - parseDate(b.date);
          });

          console.log("✨ カレンダー同期・日付ソート完了後のデータ:", cleanedData);
          setStocks(cleanedData);
        }
        setLoading(false); 
      })
      .catch(err => {
        console.error("❌ データ取得失敗:", err);
        setLoading(false);
      });
  }, []);

  const getFilteredStocks = () => {
    return stocks.filter(stock => {
      if (activeTab === 'thisWeek') {
        return stock.week === 'this' || stock.week === 'undefined' || !stock.week;
      }
      if (activeTab === 'nextWeek') {
        return stock.week === 'next';
      }
      return true;
    });
  };

  if (loading) {
    return (
      <div style={{ color: '#000', fontFamily: 'monospace', padding: '20px', letterSpacing: '0.1em' }}>
        📡 RUNNING RADAR SYSTEM... LOADING PORTFOLIO ASSETS...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', fontFamily: 'monospace', color: '#000' }}>
      <h2 style={{
        borderBottom:'2px solid black', fontStyle: 'italic', marginTop:'0em',
        fontFamily: 'futura-pt, sans-serif', fontSize: '2rem', fontWeight: 'bold', color: '#111'
      }}>
        EARNINGS CALENDAR
      </h2>

      <div style={{ display: 'flex', borderBottom: '2px solid #000', marginBottom: '20px' }}>
        {(['thisWeek', 'nextWeek'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px 16px', cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#000' : '#f1f1f1',
              color: activeTab === tab ? '#fff' : '#000',
              border: 'none', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.05em',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'thisWeek' && '今週の決算銘柄'}
            {tab === 'nextWeek' && '来週の決算銘柄'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {getFilteredStocks().length === 0 ? (
          <div style={{ padding: '20px', color: '#666', fontStyle: 'italic', textAlign: 'center', border: '2px dashed #000', backgroundColor: '#fafafa' }}>
            対象の決算スケジュールはありません
          </div>
        ) : (
          getFilteredStocks().map((stock, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', 
                border: stock.isWatch ? '1.2px solid #000' : '1px dashed #ccc',
                backgroundColor: '#fff',
                boxShadow: stock.isWatch ? '1px 1px 0px #000' : 'none',
                transition: 'all 0.1s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', minWidth: '60px' }}>
                  {stock.date}
                </span>
                <span style={{ 
                  fontSize: '0.7rem', color: '#000', fontWeight: '900', 
                  backgroundColor: stock.market === 'US' ? '#fee2e2' : '#e8e8e8', 
                  padding: '2px 6px', borderRadius: '2px', fontFamily: 'Courier New, monospace' 
                }}>
                  {stock.code}
                </span>
                <span style={{ fontWeight: stock.isWatch ? '900' : '500', fontSize: '0.75rem', color: '#000' }}>
                  {stock.name}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.6rem', border: '1px solid #000', padding: '3px 8px', fontWeight: 'bold', backgroundColor: '#fff' }}>
                  {stock.time}
                </span>
                {stock.isWatch && (
                  <span style={{ fontSize: '0.6rem', backgroundColor: '#000', color: '#fff', padding: '4px 8px', fontWeight: '900', letterSpacing: '0.05em' }}>
                    ★ FOCUS
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}