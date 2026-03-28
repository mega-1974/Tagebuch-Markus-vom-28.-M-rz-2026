/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Mood } from '../types';
import { MOOD_EMOJIS, MOOD_LABELS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMoodFilter: Mood | null;
  setSelectedMoodFilter: (mood: Mood | null) => void;
  availableTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedMoodFilter,
  setSelectedMoodFilter,
  availableTags,
  selectedTags,
  setSelectedTags,
}) => {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMoodFilter(null);
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery || selectedMoodFilter || selectedTags.length > 0;

  return (
    <div className="space-y-4 mb-12">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suche in deinen Einträgen..."
            className="w-full pl-14 pr-6 py-5 bg-white rounded-[32px] border border-stone-100 focus:border-stone-300 focus:ring-0 transition-all text-sm text-stone-700 placeholder:text-stone-300 shadow-sm"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`px-8 py-5 rounded-[32px] font-medium flex items-center gap-3 transition-all border ${
            isFilterOpen || hasActiveFilters
              ? 'bg-stone-800 text-white border-stone-800 shadow-xl shadow-stone-200'
              : 'bg-white text-stone-500 border-stone-100 hover:bg-stone-50 shadow-sm'
          }`}
        >
          <Filter size={18} />
          Filter
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-white text-stone-800 rounded-full flex items-center justify-center text-[10px] font-bold">
              !
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[32px] p-8 border border-stone-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h4 className="font-serif text-lg font-medium text-stone-800 tracking-tight">
                  Filteroptionen
                </h4>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-500 flex items-center gap-1"
                  >
                    <X size={12} />
                    Alle löschen
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <section>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-4">
                    Nach Stimmung filtern
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(MOOD_EMOJIS) as unknown as Mood[]).map((mood) => (
                      <button
                        key={mood}
                        onClick={() =>
                          setSelectedMoodFilter(selectedMoodFilter === Number(mood) ? null : Number(mood))
                        }
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-medium transition-all border ${
                          selectedMoodFilter === Number(mood)
                            ? 'bg-stone-800 text-white border-stone-800 shadow-lg shadow-stone-100'
                            : 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100'
                        }`}
                      >
                        <span>{MOOD_EMOJIS[Number(mood) as Mood]}</span>
                        <span>{MOOD_LABELS[Number(mood) as Mood]}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {availableTags.length > 0 && (
                  <section>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-4">
                      Nach Tags filtern
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all border ${
                            selectedTags.includes(tag)
                              ? 'bg-stone-800 text-white border-stone-800 shadow-md shadow-stone-100'
                              : 'bg-stone-50 text-stone-400 border-stone-100 hover:bg-stone-100'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
