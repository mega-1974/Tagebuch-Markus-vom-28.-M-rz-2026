/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './Sidebar';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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
      <main className="flex-1 md:ml-80 w-full relative">
        <header className="desert-cracks-header p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 w-full rounded-none sticky top-0 z-20">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] font-black text-[#636e72] mb-0.5">
              Willkommen zurück, {user.displayName.split(' ')[0]}
            </p>
            <h2 className="gold-script text-2xl md:text-3xl font-medium tracking-tight leading-tight">
              {tabTitles[activeTab]}
            </h2>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#636e72] mb-0.5">
              {new Date().toLocaleDateString('de-DE', { weekday: 'long' })}
            </p>
            <p className="font-serif text-base md:text-lg font-medium text-[#dfe6e9]">
              {new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        </header>

        <motion.div 
          className="p-4 md:p-8 w-full min-h-[calc(100vh-120px)] bg-gradient-to-br from-[#2d3436] to-[#1e272e] shadow-2xl metallic-gloss"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};
