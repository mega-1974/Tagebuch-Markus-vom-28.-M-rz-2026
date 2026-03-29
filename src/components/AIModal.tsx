import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSummarize: (prompt: string) => void;
  isProcessing: boolean;
  isCooldown?: boolean;
  title: string;
  result?: string | null;
  onSave?: (summary: string) => void;
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  onSummarize,
  isProcessing,
  isCooldown,
  title,
  result,
  onSave,
}) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif text-xl font-semibold text-slate-900">
              {result ? 'Zusammenfassung Ergebnis' : 'KI Zusammenfassung'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {!result ? (
            <>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                {title}
              </p>
              
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Was soll besonders beachtet werden? (Optional)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="z.B. 'Fasse die wichtigsten Ereignisse zusammen' oder 'Achte auf meine Stimmung'..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-700 placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400 italic">
                  Wird nichts eingegeben, wird der gesamte Inhalt zusammengefasst.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="prose prose-slate max-w-none">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {result}
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center italic">
                Diese Zusammenfassung wurde von einer KI generiert.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          {!result ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => onSummarize(prompt)}
                disabled={isProcessing || isCooldown}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verarbeite...
                  </>
                ) : isCooldown ? (
                  <>
                    <Loader2 size={16} />
                    Warten...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Zusammenfassen
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Schließen
              </button>
              <button
                onClick={() => onSave?.(result)}
                className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-2"
              >
                Speichern
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
