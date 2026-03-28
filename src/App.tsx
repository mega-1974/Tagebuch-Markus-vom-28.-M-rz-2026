/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDiary } from './hooks/useDiary';
import { useDocuments } from './hooks/useDocuments';
import { useSummaries } from './hooks/useSummaries';
import { useTrash } from './hooks/useTrash';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => void;
}
import { localBackupService } from './services/localBackupService';
import { useCloudStatus } from './hooks/useCloudStatus';
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
import { FileExplorer } from './components/FileExplorer';
import { SummaryList } from './components/SummaryList';
import { TrashView } from './components/TrashView';
import { AIModal } from './components/AIModal';
import { DiaryEntry, Mood, DiaryDocument, AISummary } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, CloudOff, BookOpen, List as ListIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { isSameDay, format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const isCloudConnected = useCloudStatus();
  const { entries, loading: diaryLoading, addEntry, updateEntry, deleteEntry } = useDiary(user?.id);
  const { documents, loading: docsLoading, uploadDocument, deleteDocument } = useDocuments(user?.id);
  const { summaries, loading: summariesLoading, saveSummary, deleteSummary } = useSummaries(user?.id);
  const { trashItems, restoreItem, permanentlyDeleteItem, emptyTrash } = useTrash(user?.id);

  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'files' | 'summaries' | 'settings' | 'trash'>('home');
  const [viewMode, setViewMode] = useState<'list' | 'reading'>('list');
  const [readingIndex, setReadingIndex] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  // AI State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiItems, setAiItems] = useState<(DiaryEntry | DiaryDocument)[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [selectedExplorerIds, setSelectedExplorerIds] = useState<Set<string>>(new Set());

  // Back navigation logic
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setActiveTab(event.state.activeTab || 'home');
        setViewMode(event.state.viewMode || 'list');
        setIsFormOpen(event.state.isFormOpen || false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    // Initial state
    window.history.replaceState({ activeTab, viewMode, isFormOpen }, '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateStateAndPush = (updates: any) => {
    const newState = { activeTab, viewMode, isFormOpen, ...updates };
    window.history.pushState(newState, '');
    if (updates.activeTab !== undefined) setActiveTab(updates.activeTab);
    if (updates.viewMode !== undefined) setViewMode(updates.viewMode);
    if (updates.isFormOpen !== undefined) setIsFormOpen(updates.isFormOpen);
  };

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
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
      const matchesTags =
        selectedTags.length > 0 ? selectedTags.every((t) => entry.tags?.includes(t)) : true;

      return matchesSearch && matchesTags;
    });
  }, [entries, searchQuery, selectedTags]);

  const handleSaveEntry = async (entryData: Partial<DiaryEntry>) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, entryData);
        toast.success('Eintrag aktualisiert');
      } else {
        await addEntry(entryData);
        toast.success('Eintrag gespeichert');
      }
      updateStateAndPush({ isFormOpen: false });
      setEditingEntry(null);
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    updateStateAndPush({ isFormOpen: true });
  };

  const handleDeleteEntry = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eintrag löschen',
      message: 'Möchtest du diesen Eintrag in den Papierkorb verschieben?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await deleteEntry(id);
          toast.success('Eintrag gelöscht');
        } catch (error) {
          toast.error('Fehler beim Löschen');
        }
      },
    });
  };

  const handleDeleteDocument = (document: DiaryDocument) => {
    setConfirmModal({
      isOpen: true,
      title: 'Dokument löschen',
      message: `Möchtest du "${document.name}" in den Papierkorb verschieben?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await deleteDocument(document);
        } catch (error) {
          toast.error('Fehler beim Löschen');
        }
      },
    });
  };

  const handleSummarize = async (prompt: string) => {
    if (!user || aiItems.length === 0) return;
    
    setIsAIProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Du bist ein hilfreicher Assistent für ein persönliches Tagebuch. 
        Fasse die folgenden Inhalte zusammen. 
        Benutzeranweisung: ${prompt || "Erstelle eine prägnante Zusammenfassung der wichtigsten Punkte."}
        
        Inhalte:
        ${aiItems.map(item => 'date' in item ? `Eintrag (${format(new Date(item.date), 'dd.MM.yyyy')}): ${item.content}` : `Dokument: ${item.name}`).join('\n\n')}`,
      });

      const response = await model;
      const summaryText = response.text;

      setConfirmModal({
        isOpen: true,
        title: 'Zusammenfassung speichern?',
        message: 'Möchtest du diese KI-Zusammenfassung in deinem Archiv speichern?',
        type: 'info',
        onConfirm: async () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setIsAIModalOpen(false);
          setAiItems([]);
          setSelectedExplorerIds(new Set());
          await saveSummary({
            userId: user.id,
            title: `Zusammenfassung vom ${format(new Date(), 'dd.MM.yyyy HH:mm')}`,
            content: summaryText,
            sourceIds: aiItems.map(i => i.id),
            sourceType: aiItems.every(i => 'content' in i) ? 'entry' : aiItems.every(i => 'url' in i) ? 'document' : 'mixed',
            createdAt: new Date().toISOString(),
          });
        },
        onCancel: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setIsAIModalOpen(false);
          setAiItems([]);
          setSelectedExplorerIds(new Set());
        }
      });
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('KI-Verarbeitung fehlgeschlagen');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleExportItemPDF = (item: DiaryEntry | DiaryDocument) => {
    try {
      const doc = new jsPDF() as jsPDFWithAutoTable;
      
      doc.setFontSize(22);
      doc.setTextColor(0, 35, 102); // Midnight Blue
      
      if ('date' in item) {
        doc.text('Tagebucheintrag', 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Datum: ${format(new Date(item.date), 'dd.MM.yyyy')}`, 14, 32);
        
        doc.setFontSize(11);
        doc.setTextColor(50);
        const splitText = doc.splitTextToSize(item.content, 180);
        doc.text(splitText, 14, 45);
        
        if (item.tags.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(`Tags: ${item.tags.join(', ')}`, 14, doc.internal.pageSize.height - 20);
        }
      } else {
        doc.text('Dokument Info', 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Name: ${item.name}`, 14, 32);
        doc.text(`Typ: ${item.type}`, 14, 40);
        doc.text(`Größe: ${(item.size / 1024).toFixed(1)} KB`, 14, 48);
        doc.text(`Hochgeladen am: ${format(new Date(item.createdAt), 'dd.MM.yyyy')}`, 14, 56);
        doc.text(`Link: ${item.url}`, 14, 64);
      }
      
      const fileName = 'date' in item 
        ? `eintrag_${format(new Date(item.date), 'yyyy-MM-dd')}.pdf`
        : `dokument_info_${item.name.replace(/\s+/g, '_')}.pdf`;
        
      doc.save(fileName);
      toast.success('PDF erfolgreich erstellt');
    } catch (error) {
      console.error('PDF Error:', error);
      toast.error('Fehler beim Erstellen der PDF');
    }
  };

  const handleExportData = (formatType: 'json' | 'pdf') => {
    try {
      if (formatType === 'json') {
        const dataStr = JSON.stringify(entries, null, 2);
        const dataUri = `data:application/json;charset=utf-8,` + encodeURIComponent(dataStr);
        const exportFileDefaultName = `mein_tagebuch_export_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success('JSON Export erfolgreich');
      } else if (formatType === 'pdf') {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        
        doc.setFontSize(22);
        doc.setTextColor(0, 35, 102);
        doc.text('Mein Tagebuch - Export', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Exportiert am: ${new Date().toLocaleString('de-DE')}`, 14, 30);
        doc.text(`Nutzer: ${user?.displayName} (${user?.email})`, 14, 35);
        
        const tableData = entries.map(e => [
          new Date(e.date).toLocaleDateString('de-DE'),
          e.content,
          e.tags.join(', ')
        ]);
        
        autoTable(doc, {
          startY: 45,
          head: [['Datum', 'Inhalt', 'Tags']],
          body: tableData,
          headStyles: { fillColor: [0, 35, 102], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [240, 244, 248] },
          margin: { top: 45 },
          styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
          columnStyles: {
            1: { cellWidth: 100 }
          }
        });
        
        doc.save(`mein_tagebuch_export_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF Export erfolgreich');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Fehler beim Exportieren');
    }
  };

  const handleNextEntry = () => {
    if (readingIndex < filteredEntries.length - 1) {
      setReadingIndex(readingIndex + 1);
    }
  };

  const handlePrevEntry = () => {
    if (readingIndex > 0) {
      setReadingIndex(readingIndex - 1);
    }
  };

  const swipeHandlers = {
    onDragEnd: (e: any, info: any) => {
      if (info.offset.x < -50) handleNextEntry();
      if (info.offset.x > 50) handlePrevEntry();
    }
  };

  const handleClearLocalData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Lokale Daten löschen',
      message: 'Möchtest du wirklich alle lokalen Daten löschen? Cloud-Daten bleiben erhalten (sobald synchronisiert).',
      type: 'danger',
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        localStorage.removeItem('mindful_path_entries');
        toast.success('Lokaler Cache geleert');
        setTimeout(() => window.location.reload(), 1000);
      },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-primary rounded-2xl shadow-xl metallic-gloss"
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
          onNewEntry={() => updateStateAndPush({ isFormOpen: true })}
          activeTab={activeTab}
          setActiveTab={(tab) => updateStateAndPush({ activeTab: tab })}
        >
          <div className="max-w-4xl">
            {activeTab === 'home' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-serif text-3xl font-medium text-slate-800">Mein Tagebuch</h2>
                  <div className="flex bg-white rounded-full p-1 shadow-sm border border-slate-100">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <ListIcon size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('reading');
                        setReadingIndex(0);
                      }}
                      className={`p-2 rounded-full transition-all ${viewMode === 'reading' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <BookOpen size={20} />
                    </button>
                  </div>
                </div>

                {viewMode === 'list' ? (
                  <>
                    <SearchAndFilter
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
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
                      <EmptyState onNewEntry={() => updateStateAndPush({ isFormOpen: true })} />
                    )}
                  </>
                ) : (
                  <div className="relative min-h-[600px] flex flex-col items-center">
                    {filteredEntries.length > 0 ? (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={filteredEntries[readingIndex].id}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={swipeHandlers.onDragEnd}
                            className="w-full parchment-bg rounded-[40px] p-12 shadow-2xl min-h-[500px] flex flex-col cursor-grab active:cursor-grabbing"
                          >
                            <div className="mb-8 border-b border-stone-300/50 pb-6">
                              <span className="text-xs uppercase tracking-widest font-bold text-stone-500 block mb-2">
                                {format(new Date(filteredEntries[readingIndex].date), 'EEEE', { locale: de })}
                              </span>
                              <h3 className="font-serif text-3xl text-stone-800">
                                {format(new Date(filteredEntries[readingIndex].date), 'd. MMMM yyyy', { locale: de })}
                              </h3>
                            </div>
                            <div className="flex-1 font-serif text-xl leading-relaxed text-stone-700 whitespace-pre-wrap">
                              {filteredEntries[readingIndex].content}
                            </div>
                            <div className="mt-8 pt-6 border-t border-stone-300/50 flex justify-between items-center">
                              <div className="flex gap-2">
                                {filteredEntries[readingIndex].tags.map(tag => (
                                  <span key={tag} className="text-[10px] uppercase tracking-widest font-bold opacity-50">#{tag}</span>
                                ))}
                              </div>
                              <span className="text-xs font-mono opacity-40">{readingIndex + 1} / {filteredEntries.length}</span>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                        
                        <div className="flex gap-4 mt-8">
                          <button
                            onClick={handlePrevEntry}
                            disabled={readingIndex === 0}
                            className="p-4 rounded-full bg-white shadow-md border border-stone-100 disabled:opacity-30 text-slate-600"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            onClick={handleNextEntry}
                            disabled={readingIndex === filteredEntries.length - 1}
                            className="p-4 rounded-full bg-white shadow-md border border-stone-100 disabled:opacity-30 text-slate-600"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </div>
                        <p className="mt-4 text-slate-400 text-sm">Wische nach links oder rechts zum Blättern</p>
                      </>
                    ) : (
                      <EmptyState onNewEntry={() => updateStateAndPush({ isFormOpen: true })} />
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-8">
                <FileExplorer
                  entries={entries}
                  documents={documents}
                  selectedIds={selectedExplorerIds}
                  onSelectionChange={setSelectedExplorerIds}
                  onSelectEntry={(entry) => handleEditEntry(entry)}
                  onSelectDocument={(doc) => window.open(doc.url, '_blank')}
                  onDeleteEntry={handleDeleteEntry}
                  onDeleteDocument={handleDeleteDocument}
                  onSummarize={(items) => {
                    setAiItems(items);
                    setIsAIModalOpen(true);
                  }}
                  onExportPDF={handleExportItemPDF}
                  onUpload={uploadDocument}
                />
              </div>
            )}

            {activeTab === 'summaries' && (
              <div className="space-y-8">
                <SummaryList
                  summaries={summaries}
                  onDelete={(id) => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Zusammenfassung löschen',
                      message: 'Möchtest du diese Zusammenfassung in den Papierkorb verschieben?',
                      type: 'danger',
                      onConfirm: async () => {
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        try {
                          await deleteSummary(id);
                        } catch (error) {
                          toast.error('Fehler beim Löschen');
                        }
                      }
                    });
                  }}
                />
              </div>
            )}

            {activeTab === 'trash' && (
              <div className="space-y-8">
                <TrashView
                  trashItems={trashItems}
                  onRestore={async (item) => {
                    try {
                      await restoreItem(item);
                    } catch (e) {
                      // Error handled in hook
                    }
                  }}
                  onPermanentDelete={(item) => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Endgültig löschen',
                      message: 'Möchtest du dieses Element wirklich endgültig löschen? Dies kann nicht rückgängig gemacht werden.',
                      type: 'danger',
                      onConfirm: async () => {
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        try {
                          await permanentlyDeleteItem(item);
                        } catch (e) {
                          // Error handled in hook
                        }
                      }
                    });
                  }}
                  onEmptyTrash={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Papierkorb leeren',
                      message: 'Möchtest du den Papierkorb wirklich leeren? Alle Elemente werden endgültig gelöscht.',
                      type: 'danger',
                      onConfirm: async () => {
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        try {
                          await emptyTrash();
                        } catch (e) {
                          // Error handled in hook
                        }
                      }
                    });
                  }}
                />
              </div>
            )}

            {activeTab === 'stats' && <Stats entries={entries} />}

            {activeTab === 'settings' && (
              <Settings
                user={user}
                onExportData={handleExportData}
                onClearLocalData={handleClearLocalData}
                isBackupEnabled={localBackupService.isBackupEnabled()}
                onToggleBackup={(enabled) => {
                  localBackupService.setBackupEnabled(enabled);
                  // Force re-render to update UI
                  setActiveTab('home');
                  setTimeout(() => setActiveTab('settings'), 0);
                }}
                lastBackupTime={localBackupService.getLastBackupTime()}
                isCloudConnected={isCloudConnected}
              />
            )}
          </div>

          <AnimatePresence>
            {isFormOpen && (
              <DiaryEntryForm
                entry={editingEntry}
                onSave={handleSaveEntry}
                onCancel={() => {
                  updateStateAndPush({ isFormOpen: false });
                  setEditingEntry(null);
                }}
              />
            )}
          </AnimatePresence>

          <AIModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            onSummarize={handleSummarize}
            isProcessing={isAIProcessing}
            title={`${aiItems.length} Elemente ausgewählt`}
          />

          {activeTab === 'home' && !isFormOpen && viewMode === 'list' && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => updateStateAndPush({ isFormOpen: true })}
              className="fixed bottom-12 right-12 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-400 z-30 hover:bg-primary-dark transition-all metallic-gloss"
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
            onCancel={() => {
              if (confirmModal.onCancel) {
                confirmModal.onCancel();
              } else {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              }
            }}
          />
        </Layout>
      )}
    </ErrorBoundary>
  );
}
