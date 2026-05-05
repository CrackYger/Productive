import React from 'react';
import { Icon } from '../../../components/Icon';

interface StreakBadgeProps {
  days: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ days }) => (
  <div style={{ background: 'linear-gradient(135deg,#FF6B2B,#FF4200)', borderRadius: 12, padding: '5px 10px 5px 7px', display: 'inline-flex', alignItems: 'center', gap: 5, boxShadow: '0 4px 16px rgba(255,107,43,0.6)', animation: 'badgeBounce 3.2s ease-in-out infinite' }}>
    <Icon name="fire" size={14} color="#fff" />
    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{days}</span>
  </div>
);
