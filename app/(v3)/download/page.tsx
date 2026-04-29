import { T } from '../lib/tokens';

export default function DownloadPage() {
  return (
    <div
      style={{
        padding: '60px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
        maxWidth: 360,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.text,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        데이터 내보내기
      </span>
      <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>
        플레이 데이터를 JSON 또는 CSV 형식으로 내보냅니다.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          style={{
            padding: '8px 20px',
            background: T.text,
            border: 'none',
            color: '#fff',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          JSON
        </button>
        <button
          style={{
            padding: '8px 20px',
            background: 'none',
            border: `1px solid ${T.lineDark}`,
            color: T.text,
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          CSV
        </button>
      </div>
    </div>
  );
}
