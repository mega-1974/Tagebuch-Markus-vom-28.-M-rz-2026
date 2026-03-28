/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  type = 'info',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-stone-500'}`}>
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={onCancel}
                  className="p-2 hover:bg-stone-50 rounded-full text-stone-300 hover:text-stone-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
              <p className="text-stone-500 leading-relaxed">{message}</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 rounded-2xl border border-stone-100 text-stone-600 font-medium hover:bg-stone-50 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-6 py-3 rounded-2xl font-medium text-white transition-all shadow-lg ${
                    type === 'danger' 
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-100' 
                      : 'bg-stone-800 hover:bg-stone-900 shadow-stone-100'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
