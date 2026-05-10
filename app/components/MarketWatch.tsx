const futuraStyle = { fontFamily: '"futura-pt", sans-serif' };

export default function MarketWatch({ market, lastUpdated }: { market: any[], lastUpdated: string }) {
  return (
    <div style={{ borderRight: '1px dotted #ccc', paddingRight: '20px', maxWidth: '300px' }}>
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'baseline', 
        borderBottom: '2px solid black', 
        marginBottom: '15px' 
      }}>
        <h3 style={{ ...futuraStyle, fontWeight: 900, fontSize: '18px', fontStyle: 'italic', margin: 0 }}>
          MARKET WATCH
        </h3>
        <span style={{ ...futuraStyle, fontSize: '9px', color: '#999' }}>{lastUpdated}</span>
      </div>

      {/* MARKET LIST */}
      {market && market.map((item: any, index: number) => {
        const isVIX = item.name.toLowerCase().includes("vix");
        
        // GASから届く文字列 (+0.50% 等) で判定
        const isUp = item.change?.startsWith('+');
        const isDown = item.change?.startsWith('-');
        
        // 標準の色（上げ＝赤、下げ＝緑）
        const standardColor = isUp ? '#e11d48' : isDown ? '#16a34a' : 'black';
        
        // VIX用の色（上げ＝緑/警戒、下げ＝赤/安堵）※お好みで調整してください
        const vixColor = isUp ? '#16a34a' : isDown ? '#e11d48' : 'white';

        return (
          <div key={index} style={{ 
            marginBottom: '12px', 
            borderBottom: isVIX ? 'none' : '1px dotted #eee', 
            paddingBottom: isVIX ? '8px' : '6px', 
            backgroundColor: isVIX ? 'black' : 'transparent', 
            color: isVIX ? 'white' : 'black', 
            padding: isVIX ? '10px 8px' : '0',
            borderRadius: isVIX ? '2px' : '0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ 
                ...futuraStyle, 
                fontSize: '11px', 
                fontWeight: 900,
                letterSpacing: '0.05em' 
              }}>
                {item.name}
              </span>
              <span style={{ 
                ...futuraStyle, 
                fontSize: '16px', 
                fontWeight: 900, 
                color: isVIX ? 'white' : standardColor 
              }}>
                {/* VIXなら $ などの通貨記号を除去して純粋な指数を表示 */}
                {isVIX ? item.value.replace(/[￥$¥,]/g, '') : item.value}
              </span>
            </div>
            
            <div style={{ 
              textAlign: 'right', 
              fontSize: '11px', 
              fontWeight: 'bold', 
              lineHeight: 1,
              marginTop: '2px',
              color: isVIX ? vixColor : standardColor 
            }}>
              {item.change}
            </div>
          </div>
        );
      })}
    </div>
  );
}