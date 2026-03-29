import React from 'react';
import { AISummary } from '../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Sparkles, Trash2, FileDown, BookOpen } from 'lucide-react';

interface SummaryCardProps {
  summary: AISummary;
  onDelete: (id: string) => void;
  onExportPDF: (summary: AISummary) => void;
  onClick: (summary: AISummary) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, onDelete, onExportPDF, onClick }) => {
  const date = new Date(summary.createdAt);
  const formattedDate = format(date, 'EEEE, d. MMMM yyyy', { locale: de });

  return (
    <div
      onClick={() => onClick(summary)}
      className="parchment rounded-none p-6 shadow-sm border border-[#d3cbb8] hover:shadow-md transition-shadow relative group cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-black/5 flex items-center justify-center text-[#1a1a1a]/60">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-[#1a1a1a]">
              {summary.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-[#1a1a1a]/60">
              <span>{format(date, 'HH:mm')} Uhr</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onExportPDF(summary)}
            title="Als PDF exportieren"
            className="p-2 rounded-none hover:bg-black/5 text-primary-light hover:text-primary transition-colors"
          >
            <FileDown size={16} />
          </button>
          <button
            onClick={() => onClick(summary)}
            title="Im Lesemodus ansehen"
            className="p-2 rounded-none hover:bg-black/5 text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
          >
            <BookOpen size={16} />
          </button>
          <button
            onClick={() => onDelete(summary.id)}
            title="Löschen"
            className="p-2 rounded-none hover:bg-red-500/10 text-[#1a1a1a]/60 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <div className="flex items-center gap-1 px-3 py-1 bg-[#1e272e] text-[#636e72] text-[10px] uppercase tracking-wider font-semibold rounded-none border border-[#3e362e]">
          {summary.sourceType === 'entry' ? 'Tagebuch' : 
           summary.sourceType === 'document' ? 'Dokumente' : 'Gemischt'}
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-[#1e272e] text-[#636e72] text-[10px] uppercase tracking-wider font-semibold rounded-none border border-[#3e362e]">
          {summary.sourceIds.length} Quellen
        </div>
      </div>
    </div>
  );
};
