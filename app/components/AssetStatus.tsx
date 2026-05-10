const futuraStyle = { fontFamily: '"futura-pt", sans-serif' };

export default function AssetStatus({ data }: { data: any }) {
  return (
    <div>
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', border: '1px solid #eee', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: 900, borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>ダブルインバース坂ノボルの<br />運用成績</h3>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <p style={{ ...futuraStyle, fontSize: '14px', color: '#000', marginBottom: '5px', fontWeight: 'bold' }}>総投資額</p>
          <span style={{ ...futuraStyle, fontSize: '20px', fontWeight: 900, color: data.isPositive ? '#000' : '#16a34a', display: 'block' }}>{data.principal}</span>
        </div>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <p style={{ ...futuraStyle, fontSize: '14px', color: '#000', marginBottom: '5px', fontWeight: 'bold' }}>時価評価額</p>
          <span style={{ ...futuraStyle, fontSize: '28px', fontWeight: 900, color: data.isPositive ? '#e11d48' : '#16a34a', display: 'block' }}>{data.totalAssets}</span>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px dotted #ccc', paddingTop: '10px' }}>
          <p style={{ ...futuraStyle, fontSize: '14px', color: '#000', marginBottom: '2px', fontWeight: 'bold' }}>GROWTH RATE</p>
          <span style={{ ...futuraStyle, fontSize: '20px', fontWeight: 900, color: data.isPositive ? '#e11d48' : '#16a34a' }}>
            {data.isPositive ? '▲' : '▼'} {data.ratio}
          </span>
        </div>
      </div>
      <div style={{ borderTop: '2px solid black', paddingTop: '15px' }}>
        <h3 style={{ ...futuraStyle, fontSize: '12px', fontWeight: 900, marginBottom: '10px' }}>SOCIAL MEDIA</h3>
        <div style={{ padding: '15px', border: '1px solid #ccc', textAlign: 'center' }}>
          <a href="https://x.com/cabaffett1106" target="_blank" rel="noopener noreferrer" style={{ display: 'block', backgroundColor: 'black', color: 'white', padding: '10px', fontSize: '11px', fontWeight: 900, textDecoration: 'none' }}>X　ダブルインバース坂ノボル</a>
        </div>
      </div>
    </div>
  );
}