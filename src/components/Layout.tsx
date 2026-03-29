/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './Sidebar';
import { UserProfile } from '../types';

interface LayoutProps {
  user: UserProfile;
  onSignOut: () => void;
  onNewEntry: () => void;
  activeTab: 'home' | 'stats' | 'files' | 'summaries' | 'settings' | 'trash';
  setActiveTab: (tab: 'home' | 'stats' | 'files' | 'summaries' | 'settings' | 'trash') => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  user,
  onSignOut,
  onNewEntry,
  activeTab,
  setActiveTab,
  children,
}) => {
  const tabTitles = {
    home: 'Deine Übersicht',
    files: 'Datei-Explorer',
    summaries: 'KI Zusammenfassungen',
    stats: 'Deine Statistiken',
    trash: 'Papierkorb',
    settings: 'Einstellungen',
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#1e272e]">
      <Sidebar
        user={user}
        onSignOut={onSignOut}
        onNewEntry={onNewEntry}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1 flex flex-col md:ml-80 w-full relative">
        <header className="desert-cracks-header p-3 md:p-6 flex flex-row justify-between items-center w-full md:w-[calc(100%-320px)] rounded-none fixed top-0 z-30 backdrop-blur-md bg-[#001a4d]/90 border-b border-white/10 h-20 md:h-24">
          <div>
            <p className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-black text-[#636e72] mb-0.5">
              Willkommen zurück, {user.displayName.split(' ')[0]}
            </p>
            <h2 className="gold-script text-xl md:text-3xl font-medium tracking-tight leading-tight">
              {tabTitles[activeTab]}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] font-bold text-[#636e72] mb-0.5">
              {new Date().toLocaleDateString('de-DE', { weekday: 'short' })}
            </p>
            <p className="font-serif text-sm md:text-lg font-medium text-[#dfe6e9]">
              {new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </header>

        <div className="p-4 md:py-8 md:pr-8 md:pl-8 w-full min-h-screen pt-24 md:pt-28 bg-gradient-to-br from-[#2d3436] to-[#1e272e] shadow-2xl metallic-gloss relative">
          {children}
        </div>
      </div>
    </div>
  );
};
