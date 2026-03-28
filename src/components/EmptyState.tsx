/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Plus, Heart } from 'lucide-react';

interface EmptyStateProps {
  onNewEntry: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewEntry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 bg-stone-100 rounded-[32px] flex items-center justify-center mb-8 text-stone-300"
      >
        <Heart size={48} fill="currentColor" />
      </motion.div>
      <h3 className="font-serif text-2xl font-medium text-stone-800 mb-4 tracking-tight">
        Noch keine Einträge
      </h3>
      <p className="text-stone-500 text-sm mb-12 max-w-xs leading-relaxed">
        Beginne heute damit, deine Gedanken und Gefühle festzuhalten. 
        Jeder Schritt zählt auf deinem Weg.
      </p>
      <button
        onClick={onNewEntry}
        className="flex items-center gap-3 px-10 py-4 bg-stone-800 text-white rounded-full font-medium hover:bg-stone-700 transition-all shadow-xl shadow-stone-200 group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
        Ersten Eintrag erstellen
      </button>
    </div>
  );
};
