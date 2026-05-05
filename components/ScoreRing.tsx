import React, { useState, useEffect } from 'react';

interface ScoreRingProps {
  score: number;
  accent: string;
  green: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, accent, green }) => {
  const W = 220, H = 130, cx = 110, cy = 120, r = 88;
  const toRad = (d: number) => d * Math.PI / 180;

  const arc = (a: number, b: number) => {
    const sa = toRad(a), ea = toRad(b);
    return `M ${cx + r * Math.cos(sa)} ${cy + r * Math.sin(sa)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(ea)} ${cy + r * Math.sin(ea)}`;
  };

  const len = Math.PI * r;
  const [on, setOn] = useState(false);
  const [n, setN]   = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 160);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!on) return;
    const t0 = performance.now(), dur = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setN(Math.round(e * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [on, score]);

  // arc top = cy - r = 32, bottom = cy = 120; nudged down for visual balance
  const numY   = 96;
  const labelY = 120;

  return (
    <div style={{ position: 'relative', width: W, height: H, flexShrink: 0 }}>
      {/* ambient glow behind arc */}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        width: 160, height: 80, borderRadius: '50%',
        background: `radial-gradient(ellipse,${accent}40 0%,${green}10 60%,transparent 80%)`,
        filter: 'blur(14px)',
        animation: 'glowPulse 2.5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={green} />
            <stop offset="55%"  stopColor={accent} />
            <stop offset="100%" stopColor={accent} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* glow halo */}
        <path d={arc(180, 0)} fill="none" stroke={accent} strokeWidth="22" strokeLinecap="round" opacity="0.06" />
        {/* base track */}
        <path d={arc(180, 0)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" strokeLinecap="round" />
        {/* filled progress */}
        <path
          d={arc(180, 0)} fill="none" stroke="url(#rg)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={on ? len - (score / 100) * len : len}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.05,0.64,1)', filter: `drop-shadow(0 0 7px ${accent}95)` }}
        />

        {/* tick marks */}
        {[0, 25, 50, 75, 100].map(v => {
          const rd = toRad(180 - v * 1.8);
          return (
            <line key={v}
              x1={cx + (r - 8) * Math.cos(rd)} y1={cy + (r - 8) * Math.sin(rd)}
              x2={cx + (r + 8) * Math.cos(rd)} y2={cy + (r + 8) * Math.sin(rd)}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round"
            />
          );
        })}

        {/* score number — centered inside arc */}
        <text
          x={cx} y={numY}
          textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize="50" fontWeight="800"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          letterSpacing="-2"
          style={{ animation: on ? 'scorePulse 2s 1.5s ease-in-out 2' : 'none' }}
        >{n}</text>

        {/* label */}
        <text
          x={cx} y={labelY}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.35)" fontSize="8.5" fontWeight="700"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          letterSpacing="3"
        >SCORE</text>
      </svg>
    </div>
  );
};
