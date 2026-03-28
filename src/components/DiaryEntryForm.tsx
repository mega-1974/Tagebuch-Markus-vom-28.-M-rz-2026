/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DiaryEntry, Mood } from '../types';
import { MoodSelector } from './MoodSelector';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Tag as TagIcon } from 'lucide-react';

interface DiaryEntryFormProps {
  entry?: DiaryEntry | null;
  onSave: (entry: Partial<DiaryEntry>) => void;
  onCancel: () => void;
}

import { JournalingPrompts } from './JournalingPrompts';

export const DiaryEntryForm: React.FC<DiaryEntryFormProps> = ({ entry, onSave, onCancel }) => {
  const [mood, setMood] = useState<Mood | null>(entry?.mood || null);
  const [content, setContent] = useState(entry?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);

  useEffect(() => {
    if (entry) {
      setMood(entry.mood);
      setContent(entry.content);
      setTags(entry.tags || []);
    }
  }, [entry]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!mood || !content.trim()) return;
    onSave({
      mood,
      content,
      tags,
      date: entry?.date || new Date().toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
        <div className="p-8 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl font-medium text-stone-800">
              {entry ? 'Eintrag bearbeiten' : 'Wie geht es dir heute?'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            <section>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-3">
                Deine Stimmung
              </label>
              <MoodSelector selectedMood={mood} onSelectMood={setMood} />
            </section>

            <section>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-3">
                Deine Gedanken
              </label>
              <div className="mb-4">
                <JournalingPrompts />
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Schreibe hier, was dich heute beschäftigt..."
                className="w-full h-48 p-6 bg-stone-50 rounded-3xl border border-stone-100 focus:border-stone-300 focus:ring-0 transition-all resize-none text-stone-700 placeholder:text-stone-300"
              />
            </section>

            <section>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-3">
                Tags (Enter zum Hinzufügen)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full border border-stone-200"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <TagIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="z.B. Schlaf, Arbeit, Familie..."
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 rounded-2xl border border-stone-100 focus:border-stone-300 focus:ring-0 transition-all text-sm text-stone-700 placeholder:text-stone-300"
                />
              </div>
            </section>
          </div>
        </div>

        <div className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-4 shrink-0">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-full text-stone-500 font-medium hover:bg-stone-100 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!mood || !content.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-stone-800 text-white rounded-full font-medium hover:bg-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-stone-200"
          >
            <Save size={18} />
            Speichern
          </button>
        </div>
      </div>
    </motion.div>
  );
};
