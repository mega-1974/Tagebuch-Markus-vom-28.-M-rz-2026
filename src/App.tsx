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
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfirmModal } from './components/ConfirmModal';
import { FileExplorer } from './components/FileExplorer';
import { SummaryList } from './components/SummaryList';
import { TrashView } from './components/TrashView';
import { AIModal } from './components/AIModal';
import { DiaryEntry, Mood, DiaryDocument, AISummary } from './types';
import { Plus, CloudOff, BookOpen, List as ListIcon, ChevronLeft, ChevronRight, Sparkles, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { isSameDay, format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function App() {
  console.log('App component initializing...');
  
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const isCloudConnected = useCloudStatus();
  const { entries, loading: diaryLoading, addEntry, updateEntry, deleteEntry } = useDiary(user?.id);
  const { documents, loading: docsLoading, uploadDocument, deleteDocument } = useDocuments(user?.id);
  const { summaries, loading: summariesLoading, saveSummary, deleteSummary } = useSummaries(user?.id);
  const { trashItems, restoreItem, permanentlyDeleteItem, emptyTrash } = useTrash(user?.id);

  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'files' | 'summaries' | 'settings' | 'trash'>('home');
  const [viewMode, setViewMode] = useState<'list' | 'reading'>('list');
  const [readingType, setReadingType] = useState<'entry' | 'summary'>('entry');
  const [readingIndex, setReadingIndex] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  // AI State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiItems, setAiItems] = useState<(DiaryEntry | DiaryDocument)[]>([]);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isAICooldown, setIsAICooldown] = useState(false);
  const [selectedExplorerIds, setSelectedExplorerIds] = useState<Set<string>>(new Set());

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

  const filteredEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    if (!user || aiItems.length === 0) {
      toast.error('Keine Einträge oder Dokumente zum Zusammenfassen ausgewählt.');
      return;
    }
    
    if (isAICooldown) {
      toast.info('Bitte warte einen Moment, bevor du eine neue Anfrage sendest.');
      return;
    }

    setIsAIProcessing(true);
    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
      
      if (!apiKey) {
        toast.error('KI-API-Schlüssel fehlt. Bitte konfiguriere VITE_GEMINI_API_KEY.');
        setIsAIProcessing(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const parts: any[] = [
        { text: `Du bist ein hilfreicher Assistent für ein persönliches Tagebuch. 
        Fasse die folgenden Inhalte zusammen. 
        Benutzeranweisung: ${prompt || "Erstelle eine prägnante Zusammenfassung der wichtigsten Punkte."}\n\nInhalte:` }
      ];

      for (const item of aiItems) {
        if ('date' in item) {
          const textContent = item.content.replace(/<[^>]*>/g, ' ');
          parts.push({ text: `Eintrag (${format(new Date(item.date), 'dd.MM.yyyy')}): ${textContent}\n\n` });
        } else {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(item.url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            parts.push({ text: `Dokument (${item.name}):\n`, inlineData: { mimeType: item.type, data: base64 } });
          } catch (err) {
            parts.push({ text: `Dokument (${item.name}): [Inhalt konnte nicht geladen werden]\n\n` });
          }
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts }],
      });

      let summaryText = 'Keine Zusammenfassung generiert.';
      try {
        summaryText = response.text || summaryText;
      } catch (e) {
        summaryText = 'Die Zusammenfassung konnte aufgrund von Sicherheitsrichtlinien nicht generiert werden.';
      }

      setAiResult(summaryText);
      
      // Start cooldown after success
      setIsAICooldown(true);
      setTimeout(() => setIsAICooldown(false), 10000); // 10 seconds cooldown
    } catch (error: any) {
      console.error('AI Error:', error);
      const errorMessage = error?.message || '';
      
      if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('rate limit')) {
        toast.error('Google macht gerade eine kurze Pause. Bitte warte ca. 60 Sekunden, bevor du es erneut versuchst.', {
          duration: 5000
        });
      } else if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        toast.error('KI gerade überlastet, bitte kurz warten');
      } else {
        toast.error('KI-Verarbeitung fehlgeschlagen');
      }
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleSaveAISummary = async (summaryText: string) => {
    if (!user) return;
    try {
      await saveSummary({
        userId: user.id,
        title: `Zusammenfassung vom ${format(new Date(), 'dd.MM.yyyy HH:mm')}`,
        content: summaryText,
        sourceIds: aiItems.map(i => i.id),
        sourceType: aiItems.every(i => 'content' in i) ? 'entry' : aiItems.every(i => 'url' in i) ? 'document' : 'mixed',
        createdAt: new Date().toISOString(),
      });
      setIsAIModalOpen(false);
      setAiResult(null);
      setAiItems([]);
      setSelectedExplorerIds(new Set());
      toast.success('Zusammenfassung gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleExportItemPDF = (item: DiaryEntry | DiaryDocument | AISummary) => {
    try {
      const doc = new jsPDF() as jsPDFWithAutoTable;
      doc.setFontSize(22);
      doc.setTextColor(0, 35, 102);
      if ('date' in item) {
        doc.text('Tagebucheintrag', 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Datum: ${format(new Date(item.date), 'dd.MM.yyyy')}`, 14, 32);
        const plainText = item.content.replace(/<[^>]*>/g, ' ');
        const splitText = doc.splitTextToSize(plainText, 180);
        doc.text(splitText, 14, 45);
      } else if ('sourceType' in item) {
        doc.text('KI Zusammenfassung', 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Titel: ${item.title}`, 14, 32);
        doc.text(`Erstellt am: ${format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm')}`, 14, 40);
        const splitText = doc.splitTextToSize(item.content, 180);
        doc.text(splitText, 14, 55);
      } else {
        doc.text('Dokument Info', 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Name: ${item.name}`, 14, 32);
        doc.text(`Typ: ${item.type}`, 14, 40);
        doc.text(`Link: ${item.url}`, 14, 64);
      }
      doc.save('export.pdf');
      toast.success('PDF erfolgreich erstellt');
    } catch (error) {
      toast.error('Fehler beim Erstellen der PDF');
    }
  };

  const handleExportData = (formatType: 'json' | 'pdf') => {
    try {
      if (formatType === 'json') {
        const dataStr = JSON.stringify(entries, null, 2);
        const dataUri = `data:application/json;charset=utf-8,` + encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `export.json`);
        linkElement.click();
        toast.success('JSON Export erfolgreich');
      } else {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        doc.text('Mein Tagebuch - Export', 14, 22);
        const tableData = entries.map(e => [new Date(e.date).toLocaleDateString('de-DE'), e.content.replace(/<[^>]*>/g, ' '), e.tags.join(', ')]);
        autoTable(doc, { head: [['Datum', 'Inhalt', 'Tags']], body: tableData });
        doc.save(`export.pdf`);
        toast.success('PDF Export erfolgreich');
      }
    } catch (error) {
      toast.error('Fehler beim Exportieren');
    }
  };

  const handleNextEntry = () => {
    const list = readingType === 'entry' ? filteredEntries : summaries;
    if (readingIndex < list.length - 1) setReadingIndex(readingIndex + 1);
  };

  const handlePrevEntry = () => {
    if (readingIndex > 0) setReadingIndex(readingIndex - 1);
  };

  const handleClearLocalData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Lokale Daten löschen',
      message: 'Möchtest du wirklich alle lokalen Daten löschen?',
      type: 'danger',
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        localStorage.removeItem('mindful_path_entries');
        toast.success('Lokaler Cache geleert');
        setTimeout(() => window.location.reload(), 1000);
      },
    });
  };

  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
          <div className="w-16 h-16 bg-primary rounded-2xl shadow-xl metallic-gloss animate-pulse" />
        </div>
      ) : !user ? (
        <Auth onSignIn={signIn} />
      ) : (
        <Layout
          user={user}
          onSignOut={signOut}
          onNewEntry={() => updateStateAndPush({ isFormOpen: true })}
          activeTab={activeTab}
          setActiveTab={(tab) => updateStateAndPush({ activeTab: tab })}
        >
          <div className="w-full">
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
                    {filteredEntries.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {filteredEntries.map((entry, index) => (
                          <DiaryEntryCard
                            key={entry.id}
                            entry={entry}
                            onDelete={handleDeleteEntry}
                            onEdit={handleEditEntry}
                            onExportPDF={handleExportItemPDF}
                            onSummarize={(item) => {
                              setAiItems([item]);
                              setIsAIModalOpen(true);
                            }}
                            onClick={() => {
                              setReadingIndex(index);
                              setReadingType('entry');
                              setViewMode('reading');
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState onNewEntry={() => updateStateAndPush({ isFormOpen: true })} />
                    )}
                  </>
                ) : (
                  <div className="relative min-h-[600px] flex flex-col items-center w-full">
                    {((readingType === 'entry' && filteredEntries.length > 0) || (readingType === 'summary' && summaries.length > 0)) ? (
                      <>
                        <div className="w-full max-w-4xl perspective-1000">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${readingType}-${readingIndex}`}
                              initial={{ rotateY: 45, opacity: 0, x: 50 }}
                              animate={{ rotateY: 0, opacity: 1, x: 0 }}
                              exit={{ rotateY: -45, opacity: 0, x: -50 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              className="w-full parchment rounded-none p-8 md:p-12 shadow-2xl min-h-[600px] flex flex-col relative"
                              style={{ transformOrigin: readingType === 'entry' ? 'left' : 'center' }}
                            >
                              {readingType === 'entry' ? (
                                <>
                                  <div className="mb-8 border-b border-stone-300/50 pb-6">
                                    <span className="text-xs uppercase tracking-widest font-bold text-stone-500 block mb-2">
                                      {format(new Date(filteredEntries[readingIndex].date), 'EEEE', { locale: de })}
                                    </span>
                                    <h3 className="font-serif text-3xl text-[#1a1a1a]">
                                      {format(new Date(filteredEntries[readingIndex].date), 'd. MMMM yyyy', { locale: de })}
                                    </h3>
                                  </div>
                                  <div className="flex-1 parchment p-0 rounded-none shadow-none min-h-[400px] text-[#1a1a1a]">
                                    <div 
                                      className="prose prose-lg max-w-none text-[#1a1a1a] leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: filteredEntries[readingIndex].content }}
                                    />
                                  </div>
                                  <div className="mt-8 pt-6 border-t border-stone-300/50 flex justify-between items-center">
                                    <div className="flex gap-2">
                                      {filteredEntries[readingIndex].tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-widest font-bold opacity-50">#{tag}</span>
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button 
                                        onClick={() => {
                                          setAiItems([filteredEntries[readingIndex]]);
                                          setIsAIModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-black/5 rounded-full text-slate-400 hover:text-purple-600 transition-all"
                                        title="Zusammenfassen"
                                      >
                                        <Sparkles size={18} />
                                      </button>
                                      <button 
                                        onClick={() => handleExportItemPDF(filteredEntries[readingIndex])}
                                        className="p-2 hover:bg-black/5 rounded-full text-slate-400 hover:text-blue-600 transition-all"
                                        title="Als PDF exportieren"
                                      >
                                        <FileDown size={18} />
                                      </button>
                                      <span className="text-xs font-mono opacity-40">{readingIndex + 1} / {filteredEntries.length}</span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="mb-8 border-b border-stone-300/50 pb-6">
                                    <span className="text-xs uppercase tracking-widest font-bold text-stone-500 block mb-2">
                                      KI Zusammenfassung
                                    </span>
                                    <h3 className="font-serif text-3xl text-[#1a1a1a]">
                                      {summaries[readingIndex].title}
                                    </h3>
                                  </div>
                                  <div className="flex-1 parchment p-0 rounded-none shadow-none min-h-[400px] text-[#1a1a1a]">
                                    <div className="prose prose-lg max-w-none text-[#1a1a1a] leading-relaxed">
                                      <ReactMarkdown>{summaries[readingIndex].content}</ReactMarkdown>
                                    </div>
                                  </div>
                                  <div className="mt-8 pt-6 border-t border-stone-300/50 flex justify-between items-center">
                                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                                      Erstellt am {format(new Date(summaries[readingIndex].createdAt), 'dd.MM.yyyy')}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button 
                                        onClick={() => handleExportItemPDF(summaries[readingIndex])}
                                        className="p-2 hover:bg-black/5 rounded-full text-slate-400 hover:text-blue-600 transition-all"
                                        title="Als PDF exportieren"
                                      >
                                        <FileDown size={18} />
                                      </button>
                                      <span className="text-xs font-mono opacity-40">{readingIndex + 1} / {summaries.length}</span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                        
                        <div className="flex gap-4 mt-8">
                          <button
                            onClick={handlePrevEntry}
                            disabled={readingIndex === 0}
                            className="p-4 rounded-full bg-white shadow-md border border-stone-100 disabled:opacity-30 text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            onClick={handleNextEntry}
                            disabled={readingIndex === (readingType === 'entry' ? filteredEntries.length : summaries.length) - 1}
                            className="p-4 rounded-full bg-white shadow-md border border-stone-100 disabled:opacity-30 text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </div>
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
                  summaries={summaries}
                  selectedIds={selectedExplorerIds}
                  onSelectionChange={setSelectedExplorerIds}
                  onSelectEntry={(entry) => handleEditEntry(entry)}
                  onSelectDocument={(doc) => window.open(doc.url, '_blank')}
                  onSelectSummary={(summary) => {
                    const index = summaries.findIndex(s => s.id === summary.id);
                    setReadingIndex(index);
                    setReadingType('summary');
                    setViewMode('reading');
                  }}
                  onDeleteEntry={handleDeleteEntry}
                  onDeleteDocument={handleDeleteDocument}
                  onDeleteSummary={async (id) => {
                    try {
                      await deleteSummary(id);
                    } catch (e) {}
                  }}
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
                  onView={(summary) => {
                    const index = summaries.findIndex(s => s.id === summary.id);
                    setReadingIndex(index);
                    setReadingType('summary');
                    setViewMode('reading');
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
                    } catch (e) {}
                  }}
                  onPermanentDelete={(item) => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Endgültig löschen',
                      message: 'Möchtest du dieses Element wirklich endgültig löschen?',
                      type: 'danger',
                      onConfirm: async () => {
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        try {
                          await permanentlyDeleteItem(item);
                        } catch (e) {}
                      }
                    });
                  }}
                  onEmptyTrash={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Papierkorb leeren',
                      message: 'Möchtest du den Papierkorb wirklich leeren?',
                      type: 'danger',
                      onConfirm: async () => {
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        try {
                          await emptyTrash();
                        } catch (e) {}
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
                  setActiveTab('home');
                  setTimeout(() => setActiveTab('settings'), 0);
                }}
                lastBackupTime={localBackupService.getLastBackupTime()}
                isCloudConnected={isCloudConnected}
              />
            )}
          </div>

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

          <AIModal
            isOpen={isAIModalOpen}
            onClose={() => {
              setIsAIModalOpen(false);
              setAiResult(null);
              setAiItems([]);
            }}
            onSummarize={handleSummarize}
            isProcessing={isAIProcessing}
            isCooldown={isAICooldown}
            title={
              aiItems.length > 1 
                ? `${aiItems.length} Elemente ausgewählt` 
                : aiItems[0] 
                  ? ('content' in aiItems[0] ? format(new Date((aiItems[0] as DiaryEntry).date), 'dd.MM.yyyy') : (aiItems[0] as DiaryDocument).name)
                  : 'Unbenannt'
            }
            result={aiResult}
            onSave={handleSaveAISummary}
          />

          {activeTab === 'home' && !isFormOpen && viewMode === 'list' && (
            <button
              onClick={() => updateStateAndPush({ isFormOpen: true })}
              className="fixed bottom-12 right-12 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-400 z-30 hover:bg-primary-dark transition-all metallic-gloss"
            >
              <Plus size={32} />
            </button>
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
