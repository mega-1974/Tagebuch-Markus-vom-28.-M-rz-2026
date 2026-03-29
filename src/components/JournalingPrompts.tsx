/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'motion/react';
import { Lightbulb, RefreshCw } from 'lucide-react';

export const JournalingPrompts: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Worüber möchtest du heute schreiben?');
  const [loading, setLoading] = useState(false);

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
      if (!apiKey) {
        throw new Error('API Key missing');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generiere eine kurze, tiefgründige Journaling-Frage für jemanden, der seine mentale Gesundheit dokumentiert. Auf Deutsch. Nur die Frage.",
      });
      setPrompt(response.text || 'Was hat dich heute zum Lächeln gebracht?');
    } catch (error: any) {
      console.error('Error fetching prompt:', error);
      const errorMessage = error?.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('rate limit')) {
        setPrompt('Google macht gerade eine kurze Pause. Bitte warte ca. 60 Sekunden.');
      } else {
        setPrompt('Was war heute dein kleinster Erfolg?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 flex items-start gap-4">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-400 border border-stone-100 shrink-0">
        <Lightbulb size={20} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
            Schreibimpuls
          </p>
          <button
            onClick={fetchPrompt}
            disabled={loading}
            className="text-stone-300 hover:text-stone-500 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-sm text-stone-600 font-medium leading-relaxed">
          {loading ? 'Lade Impuls...' : prompt}
        </p>
      </div>
    </div>
  );
};
