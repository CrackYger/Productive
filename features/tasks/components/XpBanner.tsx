import React from 'react';
import { Icon } from '../../../components/Icon';

interface XpBannerProps {
  accent: string;
  score: number;
}

export const XpBanner: React.FC<XpBannerProps> = ({ accent, score }) => (
  <div style={{ background: `linear-gradient(135deg,${accent}d0 0%,#008880 100%)`, borderRadius: 16, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${accent}60`, boxShadow: `0 4px 24px ${accent}35` }}>
    <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name="bolt" size={19} color="#fff" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Aufgabe erledigt +10 XP</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 1, letterSpacing: -0.3 }}>Produktivitätsscore</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{score} / 100 · Tracking aktiv</div>
    </div>
    <Icon name="chevron" size={18} color="rgba(255,255,255,0.55)" />
  </div>
);
