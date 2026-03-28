import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSummarize: (prompt: string) => void;
  isProcessing: boolean;
  title: string;
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  onSummarize,
  isProcessing,
  title,
}) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <Sparkles size={20} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-slate-900">KI Zusammenfassung</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
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
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={() => onSummarize(prompt)}
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verarbeite...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Zusammenfassen
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
