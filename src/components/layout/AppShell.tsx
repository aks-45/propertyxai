'use client';

import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-light-blue-gray dark:bg-dark-navy flex flex-col transition-colors duration-300">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto md:p-6 pb-20 md:pb-6 relative z-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
