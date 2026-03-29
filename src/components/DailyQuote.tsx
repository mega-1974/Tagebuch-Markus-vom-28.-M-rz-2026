/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'motion/react';
import { Quote, RefreshCw } from 'lucide-react';

export const DailyQuote: React.FC = () => {
  const [quote, setQuote] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
      if (!apiKey) {
        throw new Error('API Key missing');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generiere ein kurzes, unterstützendes und motivierendes Zitat für jemanden, der mit Depressionen kämpft. Nur das Zitat, kein Text davor oder danach. Auf Deutsch.",
      });
      setQuote(response.text || 'Du bist nicht allein.');
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      const errorMessage = error?.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('rate limit')) {
        setQuote('Google macht gerade eine kurze Pause. Bitte warte ca. 60 Sekunden.');
      } else {
        setQuote('Jeder neue Tag ist eine neue Chance.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[40px] p-10 border border-stone-100 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Quote size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-300">
            Gedanke des Tages
          </p>
          <button
            onClick={fetchQuote}
            disabled={loading}
            className="p-2 rounded-full hover:bg-stone-50 text-stone-300 hover:text-stone-500 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-stone-50 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-stone-50 rounded-full w-1/2 animate-pulse" />
          </div>
        ) : (
          <blockquote className="font-serif text-2xl text-stone-700 leading-relaxed italic">
            "{quote}"
          </blockquote>
        )}
      </div>
    </motion.div>
  );
};
