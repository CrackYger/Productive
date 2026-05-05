import React from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

interface StatCardProps {
  icon: IconName;
  value: string | number;
  label: string;
  color: string;
  radius: number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, radius }) => (
  <div style={{ flex: 1, background: '#12121e', borderRadius: radius, padding: '12px 6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', minWidth: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Icon name={icon} size={16} color={color} />
    </div>
    <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginTop: 5, letterSpacing: -0.5 }}>{value}</div>
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
  </div>
);
