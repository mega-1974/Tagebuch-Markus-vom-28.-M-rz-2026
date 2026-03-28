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
  activeTab: 'home' | 'stats' | 'settings';
  setActiveTab: (tab: 'home' | 'stats' | 'settings') => void;
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
    stats: 'Deine Statistiken',
    settings: 'Einstellungen',
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      <Sidebar
        user={user}
        onSignOut={onSignOut}
        onNewEntry={onNewEntry}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="flex-1 ml-80 p-16 max-w-7xl mx-auto">
        <header className="mb-16 flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-300 mb-2">
              Willkommen zurück, {user.displayName.split(' ')[0]}
            </p>
            <h2 className="font-serif text-5xl font-medium text-stone-800 tracking-tight">
              {tabTitles[activeTab]}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">
              {new Date().toLocaleDateString('de-DE', { weekday: 'long' })}
            </p>
            <p className="font-serif text-xl font-medium text-stone-800">
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
