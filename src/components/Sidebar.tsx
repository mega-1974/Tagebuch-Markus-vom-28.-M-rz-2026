/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';
import { LogOut, Home, BarChart2, Settings, Plus, Heart, FolderOpen, Sparkles, Trash2 } from 'lucide-react';
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
    <div className="w-full md:w-80 md:h-screen bg-white border-b md:border-r border-blue-100 flex flex-col p-6 md:p-8 md:fixed left-0 top-0 z-40 shadow-xl shadow-blue-900/5">
      <div className="flex items-center justify-between md:justify-start gap-3 mb-8 md:mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Heart size={20} fill="currentColor" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Mindful Path
          </h1>
        </div>
      </div>

      <button
        onClick={onNewEntry}
        className="w-full flex items-center justify-center gap-3 py-3 md:py-4 text-white rounded-full font-bold transition-all mb-8 md:mb-12 group metallic-gloss"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
        Neuer Eintrag
      </button>

      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-4 md:pb-0">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex-shrink-0 flex items-center gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all ${
              activeTab === item.id
                ? 'bg-blue-50 text-primary shadow-sm border border-blue-100'
                : 'text-slate-400 hover:text-primary hover:bg-blue-50/50'
            }`}
          >
            <item.icon size={20} />
            <span className="font-bold hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block mt-auto pt-8 border-t border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.photoURL}
            alt={user.displayName}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user.displayName}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-bold">Abmelden</span>
        </button>
      </div>
    </div>
  );
};
