/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mood } from '../types';
import { motion } from 'motion/react';
import { Sparkles, Wind, Coffee, BookOpen, Sun } from 'lucide-react';

interface MoodSuggestionsProps {
  mood: Mood;
}

export const MoodSuggestions: React.FC<MoodSuggestionsProps> = ({ mood }) => {
  const suggestions: Record<Mood, { icon: any; text: string; action: string }[]> = {
    [Mood.VERY_LOW]: [
      { icon: Wind, text: 'Nimm dir 5 Minuten für eine Atemübung.', action: 'Atmen' },
      { icon: Coffee, text: 'Trinke eine Tasse Tee und entspanne dich.', action: 'Tee trinken' },
    ],
    [Mood.LOW]: [
      { icon: BookOpen, text: 'Lies ein paar Seiten in einem Buch.', action: 'Lesen' },
      { icon: Wind, text: 'Ein kurzer Spaziergang an der frischen Luft.', action: 'Spazieren' },
    ],
    [Mood.NEUTRAL]: [
      { icon: Sparkles, text: 'Schreibe 3 Dinge auf, für die du dankbar bist.', action: 'Dankbarkeit' },
      { icon: Coffee, text: 'Gönn dir eine kleine Pause.', action: 'Pause' },
    ],
    [Mood.GOOD]: [
      { icon: Sun, text: 'Nutze die Energie für ein Hobby.', action: 'Kreativ sein' },
      { icon: Sparkles, text: 'Teile deine gute Laune mit jemandem.', action: 'Teilen' },
    ],
    [Mood.EXCELLENT]: [
      { icon: Sun, text: 'Ein perfekter Tag für etwas Neues!', action: 'Entdecken' },
      { icon: Sparkles, text: 'Halte diesen Moment besonders fest.', action: 'Festhalten' },
    ],
  };

  const currentSuggestions = suggestions[mood] || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {currentSuggestions.map((suggestion, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-stone-800 text-white p-6 rounded-[32px] flex items-center gap-6 shadow-xl shadow-stone-200"
        >
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <suggestion.icon size={24} />
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">
              Vorschlag für dich
            </p>
            <p className="text-sm font-medium leading-relaxed">{suggestion.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
