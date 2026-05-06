import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { ACCENT } from '../../../constants/theme';
import type { IconName } from '../../../components/Icon';

export type TabId = 'home' | 'books' | 'school' | 'profile';

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
}

const TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'books', label: 'Bücher', icon: 'book' },
  { id: 'school', label: 'Schule', icon: 'school' },
  { id: 'profile', label: 'Profil', icon: 'person' },
];

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  hidden?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({ active, onChange, hidden = false }) => {
  const [pressed, setPressed] = useState<TabId | null>(null);

  return (
    <div
      aria-hidden={hidden}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(6,6,12,0.94)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderTop: '0.5px solid rgba(255,255,255,0.07)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
        paddingTop: 6,
        flexShrink: 0,
        zIndex: 50,
        transform: hidden ? 'translateY(110%)' : 'translateY(0)',
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.24s ease',
      }}
    >
      <div style={{ display: 'flex' }}>
        {TABS.map(tab => {
          const isActive = active === tab.id;
          const isPressed = pressed === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              aria-label={tab.label}
              onMouseDown={() => setPressed(tab.id)}
              onMouseUp={() => setPressed(null)}
              onMouseLeave={() => setPressed(null)}
              onTouchStart={() => setPressed(tab.id)}
              onTouchEnd={() => setPressed(null)}
              onClick={() => onChange(tab.id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 0 2px', position: 'relative', minHeight: 48, transform: isPressed ? 'scale(0.82)' : 'scale(1)', transition: 'transform 0.14s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: isActive ? 28 : 0, height: 2.5, borderRadius: 99, background: ACCENT, boxShadow: isActive ? `0 0 12px ${ACCENT},0 0 24px ${ACCENT}55` : 'none', transition: 'width 0.32s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.32s ease' }} />
              <div style={{ transform: isActive ? 'scale(1.14) translateY(-1px)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <Icon name={tab.icon} size={22} color={isActive ? ACCENT : 'rgba(255,255,255,0.26)'} />
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: 0.1, color: isActive ? ACCENT : 'rgba(255,255,255,0.26)', transition: 'color 0.22s ease' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
