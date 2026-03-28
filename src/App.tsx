/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDiary } from './hooks/useDiary';
import { Layout } from './components/Layout';
import { DiaryEntryCard } from './components/DiaryEntryCard';
import { DiaryEntryForm } from './components/DiaryEntryForm';
import { EmptyState } from './components/EmptyState';
import { Auth } from './components/Auth';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { SearchAndFilter } from './components/SearchAndFilter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfirmModal } from './components/ConfirmModal';
import { DiaryEntry, Mood } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, CloudOff } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { isSameDay } from 'date-fns';

import { DailyQuote } from './components/DailyQuote';
import { MoodSuggestions } from './components/MoodSuggestions';

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { entries, loading: diaryLoading, addEntry, updateEntry, deleteEntry } = useDiary(user?.id);

  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'settings'>('home');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info',
  });

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<Mood | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach((e) => e.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMood = selectedMoodFilter ? entry.mood === selectedMoodFilter : true;
      const matchesTags =
        selectedTags.length > 0 ? selectedTags.every((t) => entry.tags?.includes(t)) : true;

      return matchesSearch && matchesMood && matchesTags;
    });
  }, [entries, searchQuery, selectedMoodFilter, selectedTags]);

  const todayEntry = useMemo(() => {
    return entries.find((e) => isSameDay(new Date(e.date), new Date()));
  }, [entries]);

  const handleSaveEntry = async (entryData: Partial<DiaryEntry>) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, entryData);
        toast.success('Eintrag aktualisiert');
      } else {
        await addEntry(entryData);
        toast.success('Eintrag gespeichert');
      }
      setIsFormOpen(false);
      setEditingEntry(null);
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eintrag löschen',
      message: 'Möchtest du diesen Eintrag wirklich unwiderruflich löschen?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteEntry(id);
          toast.success('Eintrag gelöscht');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          toast.error('Fehler beim Löschen');
        }
      },
    });
  };

  const handleExportData = (format: 'json' | 'csv') => {
    try {
      let dataStr = '';
      let mimeType = '';
      let extension = '';

      if (format === 'json') {
        dataStr = JSON.stringify(entries, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else {
        // CSV Export
        const headers = ['ID', 'Datum', 'Stimmung', 'Inhalt', 'Tags', 'Erstellt am'];
        const rows = entries.map((e) => [
          e.id,
          e.date,
          e.mood,
          `"${e.content.replace(/"/g, '""')}"`,
          `"${e.tags.join(', ')}"`,
          e.createdAt,
        ]);
        dataStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
      }

      const dataUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(dataStr);
      const exportFileDefaultName = `mindful_path_export_${new Date().toISOString().split('T')[0]}.${extension}`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success(`Daten als ${format.toUpperCase()} exportiert`);
    } catch (error) {
      toast.error('Export fehlgeschlagen');
    }
  };

  const handleClearLocalData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Lokale Daten löschen',
      message: 'Möchtest du wirklich alle lokalen Daten löschen? Cloud-Daten bleiben erhalten (sobald synchronisiert).',
      type: 'danger',
      onConfirm: () => {
        localStorage.removeItem('mindful_path_entries');
        toast.success('Lokaler Cache geleert');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setTimeout(() => window.location.reload(), 1000);
      },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-stone-800 rounded-2xl"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      {!user ? (
        <Auth onSignIn={signIn} />
      ) : (
        <Layout
          user={user}
          onSignOut={signOut}
          onNewEntry={() => setIsFormOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          <div className="max-w-4xl">
            {activeTab === 'home' && (
              <div className="space-y-8">
                {!todayEntry && <DailyQuote />}
                {todayEntry && <MoodSuggestions mood={todayEntry.mood} />}

                <SearchAndFilter
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedMoodFilter={selectedMoodFilter}
                  setSelectedMoodFilter={setSelectedMoodFilter}
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                />

                {filteredEntries.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredEntries.map((entry) => (
                        <DiaryEntryCard
                          key={entry.id}
                          entry={entry}
                          onDelete={handleDeleteEntry}
                          onEdit={handleEditEntry}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <EmptyState onNewEntry={() => setIsFormOpen(true)} />
                )}
              </div>
            )}

            {activeTab === 'stats' && <Stats entries={entries} />}

            {activeTab === 'settings' && (
              <Settings
                user={user}
                onExportData={handleExportData}
                onClearLocalData={handleClearLocalData}
              />
            )}
          </div>

          <AnimatePresence>
            {isFormOpen && (
              <DiaryEntryForm
                entry={editingEntry}
                onSave={handleSaveEntry}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingEntry(null);
                }}
              />
            )}
          </AnimatePresence>

          {activeTab === 'home' && !isFormOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFormOpen(true)}
              className="fixed bottom-12 right-12 w-16 h-16 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-2xl shadow-stone-400 z-30 hover:bg-stone-700 transition-all"
            >
              <Plus size={32} />
            </motion.button>
          )}

          <ConfirmModal
            isOpen={confirmModal.isOpen}
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          />
        </Layout>
      )}
    </ErrorBoundary>
  );
}
