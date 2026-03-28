/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiaryEntry } from '../types';

const LOCAL_STORAGE_KEY = 'mindful_path_entries';

export const localBackupService = {
  saveEntries: (entries: DiaryEntry[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving entries to local storage:', error);
    }
  },

  getEntries: (): DiaryEntry[] => {
    try {
      const entries = localStorage.getItem(LOCAL_STORAGE_KEY);
      return entries ? JSON.parse(entries) : [];
    } catch (error) {
      console.error('Error getting entries from local storage:', error);
      return [];
    }
  },

  addEntry: (entry: DiaryEntry) => {
    const entries = localBackupService.getEntries();
    const updatedEntries = [entry, ...entries];
    localBackupService.saveEntries(updatedEntries);
  },

  updateEntry: (entry: DiaryEntry) => {
    const entries = localBackupService.getEntries();
    const updatedEntries = entries.map((e) => (e.id === entry.id ? entry : e));
    localBackupService.saveEntries(updatedEntries);
  },

  deleteEntry: (id: string) => {
    const entries = localBackupService.getEntries();
    const updatedEntries = entries.filter((e) => e.id !== id);
    localBackupService.saveEntries(updatedEntries);
  },
};
