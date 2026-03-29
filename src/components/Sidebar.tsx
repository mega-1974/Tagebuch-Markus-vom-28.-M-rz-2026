/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';
import { LogOut, Home, BarChart2, Settings, Plus, FolderOpen, Sparkles, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  user: UserProfile;
  onSignOut: () => void;
  onNewEntry: () => void;
  activeTab: 'home' | 'stats' | 'files' | 'summaries' | 'settings' | 'trash';
  setActiveTab: (tab: 'home' | 'stats' | 'files' | 'summaries' | 'settings' | 'trash') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onSignOut, onNewEntry, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Übersicht' },
    { id: 'files', icon: FolderOpen, label: 'Dateien' },
    { id: 'summaries', icon: Sparkles, label: 'KI-Berichte' },
    { id: 'stats', icon: BarChart2, label: 'Statistiken' },
    { id: 'trash', icon: Trash2, label: 'Papierkorb' },
    { id: 'settings', icon: Settings, label: 'Einstellungen' },
  ];

  return (
    <div className="w-full md:w-80 md:h-screen desert-cracks-header border-b md:border-r border-white/10 flex flex-col p-3 md:p-8 md:fixed left-0 top-0 z-40 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between md:justify-start gap-3 mb-4 md:mb-16">
        <div className="flex items-center gap-3">
          <h1 className="font-script text-xl md:text-2xl font-bold tracking-tight gold-script">
            Meine Tagesberichte
          </h1>
        </div>
      </div>

      <button
        onClick={onNewEntry}
        className="w-full flex items-center justify-center gap-3 py-2 md:py-4 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold transition-all mb-4 md:mb-12 group text-sm backdrop-blur-sm"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
        Neuer Eintrag
      </button>

      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex-shrink-0 flex items-center gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all ${
              activeTab === item.id
                ? 'bg-white/15 text-white shadow-sm border border-white/20 backdrop-blur-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} />
            <span className="font-bold hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block mt-auto pt-8 border-t border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.photoURL}
            alt={user.displayName}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-bold">Abmelden</span>
        </button>
      </div>
    </div>
  );
};
