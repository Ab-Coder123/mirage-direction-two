'use client';

import * as React from 'react';
import { TopUtilityBar } from './TopUtilityBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LiveChatWidget } from './LiveChatWidget';

export interface GlobalShellProps {
  children: React.ReactNode;
}

export const GlobalShell: React.FC<GlobalShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-surface font-sans antialiased text-brand-navy">
      <div>
        <TopUtilityBar />
        <Navbar />
      </div>

      <div className="flex-1">
        {children}
      </div>

      <Footer />
      <LiveChatWidget />
    </div>
  );
};
