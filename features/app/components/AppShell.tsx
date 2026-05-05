import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthScreen } from '../../auth/components/AuthScreen';
import { TabBar }      from './TabBar';
import { HomeScreen }  from '../../tasks/components/HomeScreen';
import { BooksScreen } from '../../reading/components/BooksScreen';
import { SchuleScreen } from '../../learning/components/SchuleScreen';
import { ProfilScreen } from '../../profile/components/ProfilScreen';
import type { TabId }  from './TabBar';

const LoadingScreen: React.FC = () => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700 }}>
    Productive wird geladen...
  </div>
);

export const AppShell: React.FC = () => {
  const { loading, session } = useAuth();
  const [tab, setTab] = useState<TabId>('home');
  const [key, setKey] = useState(0);

  const go = (t: TabId) => {
    if (t === tab) return;
    setTab(t);
    setKey(k => k + 1);
  };

  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      maxWidth: 430,
      minWidth: 0,
      margin: '0 auto',
      background: '#080810',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {loading ? (
        <LoadingScreen />
      ) : !session ? (
        <AuthScreen />
      ) : (
        <>
          <div key={key} className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {tab === 'home'    && <HomeScreen />}
            {tab === 'books'   && <BooksScreen />}
            {tab === 'school'  && <SchuleScreen />}
            {tab === 'profile' && <ProfilScreen />}
          </div>
          <TabBar active={tab} onChange={go} />
        </>
      )}
    </div>
  );
};
