'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { T } from '../lib/tokens';

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
  { id: 'profile',    label: '플레이어 정보',    color: T.muted,   status: 'idle' },
  { id: 'basic',      label: 'BASIC',            color: '#16a34a', status: 'idle' },
  { id: 'advanced',   label: 'ADVANCED',         color: '#ea580c', status: 'idle' },
  { id: 'expert',     label: 'EXPERT',           color: '#dc2626', status: 'idle' },
  { id: 'master',     label: 'MASTER',           color: '#9333ea', status: 'idle' },
  { id: 'remaster',   label: 'Re:MASTER',        color: '#7c3aed', status: 'idle' },
  { id: 'recentLogs', label: '최근 플레이 기록', color: T.muted,   status: 'idle' },
  { id: 'save',       label: '서버에 저장',      color: T.text,    status: 'idle' },
];

const DIFF_STEPS = new Set(['basic', 'advanced', 'expert', 'master', 'remaster']);

interface Profile {
  nickname: string;
  title?: string;
  playCountTotal?: number;
}

export default function SyncPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<StepState[]>(INITIAL_STEPS);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
          prev.map((s) => (s.id === 'save' ? { ...s, status: 'progress' } : s)),
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
            prev.map((s) => (s.id === 'save' ? { ...s, status: 'done' } : s)),
          );
          setDone(true);
          setTimeout(() => router.push(`/${data.userProfile?.nickname}`), 1800);
        } catch (err) {
          setSteps((prev) =>
            prev.map((s) => (s.id === 'save' ? { ...s, status: 'error' } : s)),
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
  const progressPct = Math.round((doneCount / steps.length) * 100);

  return (
    <div style={{ maxWidth: 520, paddingTop: 32 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* 상태 헤드 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '-0.01em' }}>
          {done ? '수집 완료' : '데이터 수집 중'}
        </div>
        {profile ? (
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{profile.nickname}</span>
            {profile.title && (
              <span style={{ fontSize: 12, color: T.sub }}>{profile.title}</span>
            )}
            {profile.playCountTotal != null && (
              <span style={{ fontSize: 11, color: T.muted }}>
                {profile.playCountTotal.toLocaleString()}회 플레이
              </span>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 6, fontSize: 12, color: T.muted }}>
            maimai DX NET에서 데이터를 가져오는 중입니다.
          </div>
        )}
      </div>

      {/* 프로그레스 바 */}
      <div style={{ height: 2, background: T.line, marginBottom: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: T.text,
          transition: 'width 0.35s ease',
        }} />
      </div>
      <div style={{ fontSize: 10, color: T.muted, textAlign: 'right', marginBottom: 20, letterSpacing: '0.04em' }}>
        {progressPct}%
      </div>

      {/* 스텝 목록 */}
      <div>
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '20px 1fr auto',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: `1px solid ${T.line}`,
            }}
          >
            {/* 상태 아이콘 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {step.status === 'idle' && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.line }} />
              )}
              {step.status === 'progress' && (
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: `2px solid ${T.line}`,
                  borderTopColor: T.text,
                  animation: 'spin 0.7s linear infinite',
                }} />
              )}
              {step.status === 'done' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill={T.text} />
                  <path d="M4.5 8.2l2.3 2.3 4.5-4.8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {step.status === 'error' && (
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#dc2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 9, fontWeight: 700,
                }}>!</div>
              )}
            </div>

            {/* 라벨 */}
            <span style={{
              fontSize: 13,
              color: step.status === 'idle' ? T.muted : T.text,
              fontWeight: step.status === 'progress' ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}>
              {DIFF_STEPS.has(step.id) && (
                <span style={{
                  display: 'inline-block',
                  width: 7, height: 7, borderRadius: '50%',
                  background: step.status === 'idle' ? T.line : step.color,
                  flexShrink: 0,
                  transition: 'background 0.3s',
                }} />
              )}
              {step.label}
            </span>

            {/* 우측 카운트 / 상태 */}
            <span style={{
              fontSize: 12,
              color: T.muted,
              minWidth: 52,
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {step.status === 'progress' && (
                <span style={{ color: T.sub }}>수집 중</span>
              )}
              {step.status === 'done' && step.count != null && (
                <span>{step.count.toLocaleString()}곡</span>
              )}
              {step.status === 'done' && step.count == null && step.id !== 'save' && (
                <span>완료</span>
              )}
              {step.status === 'done' && step.id === 'save' && (
                <span>저장됨</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* 에러 */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          border: `1px solid #dc2626`,
          color: '#dc2626',
          fontSize: 13,
          lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      {/* 완료 */}
      {done && (
        <div style={{ marginTop: 20, fontSize: 12, color: T.muted }}>
          기록 페이지로 이동 중입니다...
        </div>
      )}
    </div>
  );
}
