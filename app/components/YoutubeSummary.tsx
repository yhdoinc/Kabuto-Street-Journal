"use client";
import { useState, useEffect } from "react";

export default function YoutubeSummary() {
  const [summary, setSummary] = useState("Loading Daily Intel...");

  useEffect(() => {
    async function fetchDailySummary() {
      const CACHE_KEY = "ksj_yt_summary";
      const TIME_KEY = "ksj_yt_timestamp";
      
      const cached = localStorage.getItem(CACHE_KEY);
      const lastFetch = localStorage.getItem(TIME_KEY);
      const now = Date.now();

      // 24時間（86,400,000ms）以内ならキャッシュを表示
      if (cached && lastFetch && now - parseInt(lastFetch) < 86400000) {
        setSummary(cached);
        return;
      }

      try {
        const res = await fetch("/api/summary");
        const data = await res.json();
        if (data.content) {
          setSummary(data.content);
          localStorage.setItem(CACHE_KEY, data.content);
          localStorage.setItem(TIME_KEY, now.toString());
        }
      } catch (e) {
        setSummary(cached || "情報の更新に失敗しました。");
      }
    }
    fetchDailySummary();
  }, []);

  return (
    <div style={{ border: '3px double black', padding: '15px', backgroundColor: '#fff' }}>
      <h3 style={{ fontFamily: 'futura-pt, sans-serif', fontWeight: 900, fontSize: '14px', borderBottom: '1px solid black', marginBottom: '10px' }}>
        DAILY YOUTUBE INTEL
      </h3>
      <div style={{ fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap', minHeight: '100px', backgroundColor: '#f9f9f9', padding: '15px' }}>
        {summary}
      </div>
    </div>
  );
}