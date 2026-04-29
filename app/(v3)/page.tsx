import { T } from './lib/tokens';

const STEPS = [
  {
    n: '01',
    title: '북마클릿 설치',
    desc: '아래 버튼을 브라우저 북마크 바로 드래그하세요.',
  },
  {
    n: '02',
    title: 'SEGA ID 로그인',
    desc: 'maimai NET (maimaidx-net.com) 에 로그인합니다.',
  },
  {
    n: '03',
    title: '북마클릿 실행',
    desc: 'maimai NET 페이지에서 설치한 북마클릿을 클릭하면 기록이 자동으로 수집됩니다.',
  },
  {
    n: '04',
    title: '기록 확인',
    desc: '레이팅 탭에서 수집된 기록과 환산 레이팅을 확인하세요.',
  },
];

const SUPPORTED_GAMES = [
  { name: 'maimai DX',    desc: '원본 레이팅',        color: '#9333ea' },
  { name: 'CHUNITHM',     desc: '레이팅 환산',         color: '#f97316' },
  { name: 'SOUND VOLTEX', desc: 'VOLFORCE 환산',       color: '#38bdf8' },
  { name: 'Arcaea',       desc: 'POTENTIAL 환산',      color: '#a855f7' },
];

const bookmarklet = `javascript:(function(){var d=document,s=d.createElement('script');s.src='https://mai-log.example.com/bookmarklet.js?t='+Date.now();d.head.appendChild(s);})()`;

export default function HomePage() {
  return (
    <div style={{ maxWidth: 560, padding: '48px 0 80px' }}>
      {/* hero */}
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: T.text,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          mai<span style={{ color: '#9333ea' }}>·</span>log
        </h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, maxWidth: 440 }}>
          maimai DX 플레이 기록을 자동으로 수집하고,
          <br />
          다른 리듬게임의 레이팅 시스템으로 환산해서 보여주는 도구입니다.
        </p>
      </div>

      {/* how it works */}
      <div style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.muted,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          시작하기
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr',
                gap: '0 16px',
                paddingBottom: 20,
                marginBottom: 20,
                borderBottom: i < 3 ? `1px solid ${T.line}` : 'none',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: T.muted,
                  letterSpacing: '0.06em',
                  paddingTop: 2,
                }}
              >
                {step.n}
              </span>
              <div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* bookmarklet */}
      <div
        style={{
          background: '#f7f7f7',
          border: `1px solid ${T.line}`,
          padding: '20px 24px',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.muted,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          북마클릿
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a
            href={bookmarklet}
            draggable
            title="이 버튼을 북마크 바로 드래그하세요"
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: T.text,
              color: '#fff',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              cursor: 'grab',
              userSelect: 'none',
            }}
          >
            mai·log 기록 수집
          </a>
          <span style={{ fontSize: 12, color: T.muted }}>← 북마크 바로 드래그</span>
        </div>
        <p style={{ fontSize: 11, color: T.muted, marginTop: 12, lineHeight: 1.6 }}>
          북마클릿은 maimai NET 페이지에서만 동작합니다.
          <br />
          수집된 데이터는 브라우저 로컬스토리지에 저장되며 외부로 전송되지 않습니다.
        </p>
      </div>

      {/* supported games */}
      <div style={{ marginTop: 40 }}>
        <h2
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.muted,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          지원 게임
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: T.line,
          }}
        >
          {SUPPORTED_GAMES.map((g) => (
            <div key={g.name} style={{ background: T.surface, padding: '14px 16px' }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: g.color,
                  letterSpacing: '0.03em',
                  marginBottom: 2,
                }}
              >
                {g.name}
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>{g.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
