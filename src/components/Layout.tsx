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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f0f4f8]">
      <Sidebar
        user={user}
        onSignOut={onSignOut}
        onNewEntry={onNewEntry}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="flex-1 md:ml-80 p-6 md:p-16 max-w-7xl mx-auto w-full">
        <header className="midnight-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-200 mb-3">
              Willkommen zurück, {user.displayName.split(' ')[0]}
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-medium text-white tracking-tight leading-tight">
              {tabTitles[activeTab]}
            </h2>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-300 mb-2">
              {new Date().toLocaleDateString('de-DE', { weekday: 'long' })}
            </p>
            <p className="font-serif text-xl md:text-2xl font-medium text-white">
              {new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        </header>

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
      </main>
    </div>
  );
};
