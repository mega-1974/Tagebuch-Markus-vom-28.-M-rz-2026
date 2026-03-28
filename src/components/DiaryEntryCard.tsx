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
      className="bg-[#2d3436] rounded-none p-6 shadow-sm border border-[#3e362e] hover:shadow-md transition-shadow relative group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#1e272e] flex items-center justify-center text-[#636e72]">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-[#dfe6e9]">
              {formattedDate}
            </h3>
            <div className="flex items-center gap-1 text-xs text-[#636e72]">
              <span>Eintrag vom {format(date, 'HH:mm')} Uhr</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 rounded-none hover:bg-[#1e272e] text-[#636e72] hover:text-[#b2bec3] transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 rounded-none hover:bg-red-900/20 text-[#636e72] hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none text-[#b2bec3] mb-4 line-clamp-3">
        {entry.content}
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-[#1e272e] text-[#636e72] text-[10px] uppercase tracking-wider font-semibold rounded-none border border-[#3e362e]"
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
