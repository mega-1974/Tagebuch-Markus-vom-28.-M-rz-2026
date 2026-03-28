/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Heart } from 'lucide-react';

interface AuthProps {
  onSignIn: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSignIn }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[48px] p-12 shadow-2xl border border-stone-100 text-center"
      >
        <div className="w-20 h-20 bg-stone-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-stone-600">
          <Heart size={40} fill="currentColor" />
        </div>
        
        <h1 className="font-serif text-4xl font-medium text-stone-800 mb-4 tracking-tight">
          Mindful Path
        </h1>
        <p className="text-stone-500 text-sm mb-12 leading-relaxed">
          Dein sicherer Ort zur Dokumentation deiner mentalen Gesundheit. 
          Sicher in der Cloud und lokal auf deinem Gerät.
        </p>

        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 py-4 text-white rounded-full font-bold transition-all shadow-xl shadow-blue-200 group mb-4 metallic-gloss"
        >
          <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
          Mit Google anmelden
        </button>

        <a
          href={window.location.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-stone-400 hover:text-stone-600 underline transition-colors"
        >
          Probleme beim Login? In neuem Tab öffnen
        </a>

        <div className="mt-12 pt-8 border-t border-stone-50">
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-300">
            Privat & Sicher
          </p>
        </div>
      </motion.div>
    </div>
  );
};
