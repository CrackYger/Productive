import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { UIChromeProvider } from './contexts/UIChromeContext';
import { AppShell } from './features/app/components/AppShell';
import './styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <UIChromeProvider>
        <AppShell />
      </UIChromeProvider>
    </AuthProvider>
  </React.StrictMode>
);
