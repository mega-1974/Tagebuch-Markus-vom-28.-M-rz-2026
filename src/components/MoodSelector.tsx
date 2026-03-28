/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mood } from '../types';
import { MOOD_EMOJIS, MOOD_LABELS, MOOD_COLORS } from '../constants';
import { motion } from 'motion/react';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onSelectMood: (mood: Mood) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => {
  return (
    <div className="flex justify-between items-center gap-2 p-4 bg-white/50 rounded-2xl border border-stone-200">
      {(Object.keys(MOOD_EMOJIS) as unknown as Mood[]).map((mood) => (
        <motion.button
          key={mood}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelectMood(Number(mood) as Mood)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            selectedMood === Number(mood)
              ? 'bg-stone-100 ring-2 ring-stone-400'
              : 'hover:bg-stone-50'
          }`}
        >
          <span className="text-3xl">{MOOD_EMOJIS[Number(mood) as Mood]}</span>
          <span className="text-[10px] uppercase tracking-wider font-medium text-stone-500">
            {MOOD_LABELS[Number(mood) as Mood]}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
