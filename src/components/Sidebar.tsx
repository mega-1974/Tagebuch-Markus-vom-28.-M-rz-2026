/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';
import { LogOut, Home, BarChart2, Settings, Plus, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  user: UserProfile;
  onSignOut: () => void;
  onNewEntry: () => void;
  activeTab: 'home' | 'stats' | 'settings';
  setActiveTab: (tab: 'home' | 'stats' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onSignOut, onNewEntry, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Übersicht' },
    { id: 'stats', icon: BarChart2, label: 'Statistiken' },
    { id: 'settings', icon: Settings, label: 'Einstellungen' },
  ];

  return (
    <div className="w-80 h-screen bg-[#f5f5f0] border-r border-stone-200 flex flex-col p-8 fixed left-0 top-0 z-40">
      <div className="flex items-center gap-3 mb-16">
        <div className="w-10 h-10 bg-stone-800 rounded-2xl flex items-center justify-center text-white">
          <Heart size={20} fill="currentColor" />
        </div>
        <h1 className="font-serif text-xl font-medium text-stone-800 tracking-tight">
          Mindful Path
        </h1>
      </div>

      <button
        onClick={onNewEntry}
        className="w-full flex items-center justify-center gap-3 py-4 bg-stone-800 text-white rounded-full font-medium hover:bg-stone-700 transition-all shadow-xl shadow-stone-200 mb-12 group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
        Neuer Eintrag
      </button>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
              activeTab === item.id
                ? 'bg-white text-stone-800 shadow-sm border border-stone-100'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100/50'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-stone-200">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.photoURL}
            alt={user.displayName}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate">{user.displayName}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-4 px-6 py-4 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Abmelden</span>
        </button>
      </div>
    </div>
  );
};
