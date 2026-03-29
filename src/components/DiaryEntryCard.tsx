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
import { Calendar, Tag, Trash2, Edit2, FileDown, Sparkles } from 'lucide-react';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: DiaryEntry) => void;
  onExportPDF: (entry: DiaryEntry) => void;
  onSummarize: (entry: DiaryEntry) => void;
  onClick: (entry: DiaryEntry) => void;
}

export const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({ entry, onDelete, onEdit, onExportPDF, onSummarize, onClick }) => {
  const date = new Date(entry.date);
  const formattedDate = format(date, 'EEEE, d. MMMM yyyy', { locale: de });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick(entry)}
      className="parchment rounded-none p-6 shadow-sm border border-[#d3cbb8] hover:shadow-md transition-shadow relative group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-black/5 flex items-center justify-center text-[#1a1a1a]/60">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-[#1a1a1a]">
              {formattedDate}
            </h3>
            <div className="flex items-center gap-1 text-xs text-[#1a1a1a]/60">
              <span>Eintrag vom {format(date, 'HH:mm')} Uhr</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSummarize(entry)}
            title="KI Zusammenfassung"
            className="p-2 rounded-none hover:bg-black/5 text-primary-light hover:text-primary transition-colors"
          >
            <Sparkles size={16} />
          </button>
          <button
            onClick={() => onExportPDF(entry)}
            title="Als PDF exportieren"
            className="p-2 rounded-none hover:bg-black/5 text-primary-light hover:text-primary transition-colors"
          >
            <FileDown size={16} />
          </button>
          <button
            onClick={() => onEdit(entry)}
            title="Bearbeiten"
            className="p-2 rounded-none hover:bg-black/5 text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            title="Löschen"
            className="p-2 rounded-none hover:bg-red-500/10 text-[#1a1a1a]/60 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div 
        className="prose prose-sm max-w-none text-[#1a1a1a] mb-4 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />

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
