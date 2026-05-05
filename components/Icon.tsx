import React from 'react';

export type IconName =
  | 'home' | 'book' | 'school' | 'person'
  | 'check' | 'plus' | 'fire' | 'star'
  | 'clock' | 'bolt' | 'chart' | 'settings'
  | 'medal' | 'target' | 'chevron' | 'bell';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = 'currentColor', style }) => {
  const s: React.CSSProperties = { width: size, height: size, display: 'inline-block', flexShrink: 0, ...style };
  const p = (children: React.ReactNode) => <svg viewBox="0 0 24 24" fill="none" style={s}>{children}</svg>;

  const icons: Record<IconName, React.ReactElement> = {
    home:     p(<><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M9 21V13h6v8" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></>),
    book:     p(<><path d="M4 4h7a4 4 0 014 4v13a3 3 0 00-3-3H4V4z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/><path d="M20 4h-7a4 4 0 00-4 4v13a3 3 0 013-3h8V4z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/></>),
    school:   p(<><path d="M12 3L2 8l10 5 10-5-10-5z" stroke={color} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round"/><path d="M2 8v6" stroke={color} strokeWidth="1.9" strokeLinecap="round"/><path d="M7 11v5.5c0 1.38 2.24 2.5 5 2.5s5-1.12 5-2.5V11" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></>),
    person:   p(<><circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.9"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.9" strokeLinecap="round"/></>),
    check:    p(<path d="M5 12l5 5L19 7" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>),
    plus:     p(<path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>),
    fire:     p(<path d="M12 2C9 6 6 9 6 13a6 6 0 0012 0c0-2.5-1.5-4.5-3-6 0 2-1 3.5-3 4.5 1-3.5 0-6 0-9.5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>),
    star:     p(<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>),
    clock:    p(<><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>),
    bolt:     p(<path d="M13 2L4 13h8l-1 9 9-11h-8l1-9z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>),
    chart:    p(<path d="M4 20h16M4 20V10l5 5 4-7 4 4V20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>),
    settings: p(<><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.8"/></>),
    medal:    p(<><circle cx="12" cy="14" r="7" stroke={color} strokeWidth="1.8"/><path d="M8.5 3h7L17 9H7L8.5 3z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 11v3l2 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>),
    target:   p(<><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/><circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8"/><circle cx="12" cy="12" r="1.5" fill={color}/></>),
    chevron:  p(<path d="M9 6l6 6-6 6" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>),
    bell:     p(<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>),
  };

  return icons[name];
};
