export default function AiReport({ content }: { content: string }) {
  // 最初の「===」より前（格言部分）と後（本文）に分ける
  const [quotePart, ...bodyParts] = content.split("===================================");
  const bodyPart = bodyParts.join("===================================");

  // 格言部分を「本文」と「著者名（— から始まる行）」に分解
  const quoteLines = quotePart.trim().split("\n");
  const authorLine = quoteLines.find(line => line.startsWith("——"));
  const textLines = quoteLines.filter(line => !line.startsWith("——"));

  return (
    <div style={{ 
      padding: '20px', 
      lineHeight: '1.6',
    }}>
      {/* タイトルセクション */}
      <h2 style={{
  fontFamily: 'futura-pt, sans-serif',
        fontSize: '1.6rem',
        fontWeight: 'bold',
        letterSpacing: '0.1em',
        margin: '0 0 16px 0',
        color: '#111',
        paddingBottom: '2em',
        textAlign: 'center'
      }}>
        LATEST <span style={{ 
    fontSize: '2.8rem', 
  }}>AI</span> MARKET REPORT
      </h2>
      {/* 格言エリア */}
      <div style={{ 
        fontWeight: 'bold', 
        fontStyle: 'italic', 
        fontSize: '1.15em',
        marginBottom: '24px',
        color: '#222'
      }}>
        {/* 格言本文：左寄せ */}
        <div style={{ textAlign: 'left', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
          {textLines.join("\n")}
        </div>
        
        {/* 著者名：右寄せ */}
        {authorLine && (
          <div style={{ textAlign: 'right', marginTop: '5px' }}>
            {authorLine}
          </div>
        )}
      </div>
      
      {bodyPart && (
        <>
          <div style={{ borderTop: '1px solid #666', margin: '80px 0 40px' }}></div>
          <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'normal', fontWeight: 'normal', textAlign:'justify'}}>
            {bodyPart}
          </div>
        </>
      )}
    </div>
  );
}