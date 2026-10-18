'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { TopUtilityBar } from './TopUtilityBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const LiveChatWidget = dynamic(
  () => import('./LiveChatWidget').then((mod) => mod.LiveChatWidget),
  { ssr: false }
);

export interface GlobalShellProps {
  children: React.ReactNode;
}

export const GlobalShell: React.FC<GlobalShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-surface font-sans antialiased text-brand-navy dark:bg-[#020F24] dark:text-[#F8FAFC] transition-colors duration-200">
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
