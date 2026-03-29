import React from 'react';
import { AISummary } from '../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, FileText, Sparkles, Calendar, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SummaryListProps {
  summaries: AISummary[];
  onDelete: (id: string) => void;
  onView: (summary: AISummary) => void;
}

export const SummaryList: React.FC<SummaryListProps> = ({ summaries, onDelete, onView }) => {
  if (summaries.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto mb-4 text-blue-500">
          <Sparkles size={32} />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-slate-900 mb-2">Keine Zusammenfassungen</h3>
        <p className="text-slate-500 max-w-xs mx-auto">
          Nutze die KI-Funktion im Datei-Explorer, um deine Einträge und Dokumente zusammenzufassen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {summaries.map((summary) => (
        <div key={summary.id} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  summary.sourceType === 'entry' ? 'bg-blue-100 text-blue-600' : 
                  summary.sourceType === 'document' ? 'bg-emerald-100 text-emerald-600' : 
                  'bg-purple-100 text-purple-600'
                }`}>
                  {summary.sourceType === 'entry' ? 'Tagebuch' : 
                   summary.sourceType === 'document' ? 'Dokumente' : 'Gemischt'}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Calendar size={10} />
                  {format(new Date(summary.createdAt), 'dd. MMM yyyy', { locale: de })}
                </span>
              </div>
              <h4 className="font-serif text-xl font-bold text-slate-900">{summary.title}</h4>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onView(summary)}
                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-xl transition-all"
                title="Im Lesemodus ansehen"
              >
                <BookOpen size={18} />
              </button>
              <button
                onClick={() => onDelete(summary.id)}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                title="Löschen"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto max-h-60 custom-scrollbar">
            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown>{summary.content}</ReactMarkdown>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <FileText size={12} />
            {summary.sourceIds.length} Quellen einbezogen
          </div>
        </div>
      ))}
    </div>
  );
};
