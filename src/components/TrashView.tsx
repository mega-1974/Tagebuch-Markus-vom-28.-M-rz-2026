import React from 'react';
import { TrashItem } from '../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, RotateCcw, FileText, BookOpen, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface TrashViewProps {
  trashItems: TrashItem[];
  onRestore: (item: TrashItem) => void;
  onPermanentDelete: (item: TrashItem) => void;
  onEmptyTrash: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({ 
  trashItems, 
  onRestore, 
  onPermanentDelete, 
  onEmptyTrash 
}) => {
  if (trashItems.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4 text-slate-400">
          <Trash2 size={32} />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-slate-900 mb-2">Papierkorb ist leer</h3>
        <p className="text-slate-500 max-w-xs mx-auto">
          Gelöschte Einträge, Dokumente und Zusammenfassungen werden hier angezeigt.
        </p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'entry': return <BookOpen size={16} />;
      case 'document': return <FileText size={16} />;
      case 'summary': return <Sparkles size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getTitle = (item: TrashItem) => {
    switch (item.type) {
      case 'entry': 
        return `Eintrag vom ${format(new Date(item.data.date), 'dd.MM.yyyy')}`;
      case 'document': 
        return item.data.name;
      case 'summary': 
        return item.data.title;
      default: 
        return 'Unbekanntes Element';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertTriangle size={24} />
          <p className="text-sm font-medium">
            Elemente im Papierkorb werden dauerhaft gelöscht, wenn du den Papierkorb leerst.
          </p>
        </div>
        <button
          onClick={onEmptyTrash}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors"
        >
          <Trash2 size={16} />
          Papierkorb leeren
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {trashItems.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                item.type === 'entry' ? 'bg-blue-50 text-blue-600' :
                item.type === 'document' ? 'bg-emerald-50 text-emerald-600' :
                'bg-purple-50 text-purple-600'
              }`}>
                {getIcon(item.type)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{getTitle(item)}</h4>
                <p className="text-xs text-slate-400 font-medium">
                  Gelöscht am {format(new Date(item.deletedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRestore(item)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-xs font-bold transition-colors"
                title="Wiederherstellen"
              >
                <RotateCcw size={16} />
                Wiederherstellen
              </button>
              <button
                onClick={() => onPermanentDelete(item)}
                className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                title="Endgültig löschen"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
