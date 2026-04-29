'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type StepId = 'profile' | 'basic' | 'advanced' | 'expert' | 'master' | 'remaster' | 'recentLogs' | 'save';
type StepStatus = 'idle' | 'progress' | 'done' | 'error';

interface StepState {
  id: StepId;
  label: string;
  color: string;
  status: StepStatus;
  count?: number;
}

const INITIAL_STEPS: StepState[] = [
  { id: 'profile',    label: '플레이어 정보',    color: '#87867f', status: 'idle' },
  { id: 'basic',      label: 'BASIC',            color: '#16a34a', status: 'idle' },
  { id: 'advanced',   label: 'ADVANCED',         color: '#ea580c', status: 'idle' },
  { id: 'expert',     label: 'EXPERT',           color: '#dc2626', status: 'idle' },
  { id: 'master',     label: 'MASTER',           color: '#9333ea', status: 'idle' },
  { id: 'remaster',   label: 'Re:MASTER',        color: '#7c3aed', status: 'idle' },
  { id: 'recentLogs', label: '최근 플레이 기록', color: '#87867f', status: 'idle' },
  { id: 'save',       label: '서버에 저장',      color: '#c96442', status: 'idle' },
];

interface Profile {
  nickname: string;
  title?: string;
  playCountTotal?: number;
  playCountVersion?: number;
}

export default function SyncPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<StepState[]>(INITIAL_STEPS);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const nicknameRef = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (!session?.user?.id) {
        window.location.href = '/api/auth/signin';
        return;
      }
      window.opener?.postMessage({ type: 'ready' }, '*');
    };
    init();

    const handler = async (e: MessageEvent) => {
      const { data } = e;
      if (!data?.type) return;

      if (data.type === 'step') {
        setSteps((prev) =>
          prev.map((s) =>
            s.id === data.id
              ? { ...s, status: data.status, count: data.count ?? s.count }
              : s,
          ),
        );
        if (data.id === 'profile' && data.status === 'done' && data.profile) {
          setProfile(data.profile);
        }
      }

      if (data.type === 'save') {
        setSteps((prev) =>
          prev.map((s) => s.id === 'save' ? { ...s, status: 'progress' } : s),
        );
        try {
          const res = await fetch('/api/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userProfile: data.userProfile,
              records: data.records,
              recentLogs: data.recentLogs,
            }),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.error ?? `서버 오류 (${res.status})`);
          }
          setSteps((prev) =>
            prev.map((s) => s.id === 'save' ? { ...s, status: 'done' } : s),
          );
          const nickname = data.userProfile?.nickname;
          nicknameRef.current = nickname;
          setDone(true);
          setTimeout(() => router.push(`/${nickname}`), 1800);
        } catch (err) {
          setSteps((prev) =>
            prev.map((s) => s.id === 'save' ? { ...s, status: 'error' } : s),
          );
          setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
        }
      }

      if (data.type === 'error') {
        setError(data.message ?? '알 수 없는 오류가 발생했습니다.');
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [router]);

  const doneCount = steps.filter((s) => s.status === 'done').length;
  const totalCount = steps.length;
  const progressPct = Math.round((doneCount / totalCount) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f4ed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'var(--font-pretendard), system-ui, Arial, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: 28,
            fontWeight: 500,
            color: '#141413',
            lineHeight: 1.2,
            marginBottom: 10,
          }}>
            {done ? '수집 완료' : '데이터 수집 중'}
          </div>

          {profile ? (
            <div>
              <span style={{ fontSize: 15, color: '#3d3d3a', fontWeight: 500 }}>
                {profile.nickname}
              </span>
              {profile.title && (
                <span style={{ fontSize: 13, color: '#87867f', marginLeft: 8 }}>
                  {profile.title}
                </span>
              )}
              {profile.playCountTotal != null && (
                <div style={{ fontSize: 12, color: '#87867f', marginTop: 4 }}>
                  총 {profile.playCountTotal.toLocaleString()}회 플레이
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: '#87867f' }}>
              maimai DX NET에서 데이터를 가져오는 중입니다.
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{
          height: 3,
          background: '#e8e6dc',
          borderRadius: 999,
          marginBottom: 24,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: '#c96442',
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Steps */}
        <div style={{
          background: '#faf9f5',
          border: '1px solid #f0eee6',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: 'rgba(0,0,0,0.04) 0px 4px 24px',
        }}>
          {steps.map((step, i) => (
            <div key={step.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '13px 20px',
              borderTop: i === 0 ? 'none' : '1px solid #f0eee6',
              transition: 'background 0.2s',
              background: step.status === 'progress' ? 'rgba(201,100,66,0.03)' : 'transparent',
            }}>
              {/* Status icon */}
              <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step.status === 'idle' && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d1cfc5' }} />
                )}
                {step.status === 'progress' && (
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid #e8e6dc',
                    borderTopColor: '#c96442',
                    animation: 'spin 0.75s linear infinite',
                  }} />
                )}
                {step.status === 'done' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="9" fill="#c96442" />
                    <path d="M5 9.2l2.8 2.8 5-5.5" stroke="#faf9f5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {step.status === 'error' && (
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#b53333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                  }}>!</div>
                )}
              </div>

              {/* Label */}
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 14,
                  color: step.status === 'idle'
                    ? '#b0aea5'
                    : step.status === 'progress'
                    ? '#3d3d3a'
                    : '#141413',
                  fontWeight: step.status === 'progress' ? 500 : 400,
                }}>
                  {step.id !== 'profile' && step.id !== 'recentLogs' && step.id !== 'save' ? (
                    <span style={{
                      display: 'inline-block',
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background: step.status === 'idle' ? '#d1cfc5' : step.color,
                      marginRight: 7,
                      verticalAlign: 'middle',
                      position: 'relative', top: -1,
                      transition: 'background 0.3s',
                    }} />
                  ) : null}
                  {step.label}
                </span>
              </div>

              {/* Right hint */}
              <div style={{ fontSize: 12, color: '#87867f', minWidth: 48, textAlign: 'right' }}>
                {step.status === 'progress' && (
                  <span style={{ color: '#c96442' }}>수집 중</span>
                )}
                {step.status === 'done' && step.count != null && (
                  <span>{step.count.toLocaleString()}곡</span>
                )}
                {step.status === 'done' && step.count == null && step.id !== 'save' && (
                  <span>완료</span>
                )}
                {step.status === 'done' && step.id === 'save' && (
                  <span style={{ color: '#c96442' }}>저장됨</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: '#faf9f5',
            border: '1px solid #b53333',
            borderRadius: 8,
            color: '#b53333',
            fontSize: 13,
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* Done message */}
        {done && (
          <div style={{
            marginTop: 24,
            textAlign: 'center',
            color: '#5e5d59',
            fontSize: 14,
            lineHeight: 1.6,
          }}>
            기록 페이지로 이동 중입니다...
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
