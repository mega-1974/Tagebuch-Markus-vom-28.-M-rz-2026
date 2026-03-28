/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiaryEntry, Mood } from '../types';
import { MOOD_EMOJIS, MOOD_LABELS, MOOD_COLORS } from '../constants';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Calendar, Tag, Trash2, Edit2 } from 'lucide-react';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: DiaryEntry) => void;
}

export const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({ entry, onDelete, onEdit }) => {
  const date = new Date(entry.date);
  const formattedDate = format(date, 'EEEE, d. MMMM yyyy', { locale: de });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow relative group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-800">
              {formattedDate}
            </h3>
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <span>Eintrag vom {format(date, 'HH:mm')} Uhr</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="prose prose-stone prose-sm max-w-none text-stone-600 mb-4 line-clamp-3">
        {entry.content}
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-stone-50 text-stone-500 text-[10px] uppercase tracking-wider font-semibold rounded-full border border-stone-100"
            >
              <Tag size={10} />
              {tag}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
