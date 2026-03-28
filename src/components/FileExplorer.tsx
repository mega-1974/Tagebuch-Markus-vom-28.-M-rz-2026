import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  File, 
  MoreVertical, 
  Download, 
  Trash2, 
  Sparkles, 
  CheckSquare, 
  Square,
  Upload,
  Loader2
} from 'lucide-react';
import { DiaryEntry, DiaryDocument } from '../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface FileExplorerProps {
  entries: DiaryEntry[];
  documents: DiaryDocument[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onSelectEntry: (entry: DiaryEntry) => void;
  onSelectDocument: (doc: DiaryDocument) => void;
  onDeleteEntry: (id: string) => void;
  onDeleteDocument: (doc: DiaryDocument) => void;
  onSummarize: (items: (DiaryEntry | DiaryDocument)[]) => void;
  onExportPDF: (item: DiaryEntry | DiaryDocument) => void;
  onUpload: (file: File) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  entries,
  documents,
  selectedIds,
  onSelectionChange,
  onSelectEntry,
  onSelectDocument,
  onDeleteEntry,
  onDeleteDocument,
  onSummarize,
  onExportPDF,
  onUpload,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['diary', 'documents']));
  const [isUploading, setIsUploading] = useState(false);

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  const diaryTree = useMemo(() => {
    const tree: any = {};
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const year = date.getFullYear().toString();
      const month = format(date, 'MMMM', { locale: de });
      
      if (!tree[year]) tree[year] = {};
      if (!tree[year][month]) tree[year][month] = [];
      tree[year][month].push(entry);
    });
    return tree;
  }, [entries]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      await onUpload(file);
      setIsUploading(false);
      // Reset input to allow uploading the same file again if needed
      e.target.value = '';
    }
  };

  const handleSummarizeSelected = () => {
    const selectedItems = [
      ...entries.filter(e => selectedIds.has(e.id)),
      ...documents.filter(d => selectedIds.has(d.id))
    ];
    if (selectedItems.length > 0) {
      onSummarize(selectedItems);
    }
  };

  const isSelected = (id: string) => selectedIds.has(id);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-serif text-xl font-semibold text-slate-900">Dateien & Einträge</h3>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleSummarizeSelected}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <Sparkles size={14} />
              Auswahl zusammenfassen ({selectedIds.size})
            </button>
          )}
          <label htmlFor="file-upload" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Datei hochladen
          </label>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </div>
      </div>

      <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {/* Diary Folder */}
        <div className="mb-4">
          <button
            onClick={() => toggleFolder('diary')}
            className="flex items-center gap-2 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-sm"
          >
            {expandedFolders.has('diary') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder size={18} className="text-blue-500 fill-blue-50" />
            Mein Tagebuch
          </button>
          
          <AnimatePresence>
            {expandedFolders.has('diary') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-6 overflow-hidden"
              >
                {Object.keys(diaryTree).sort((a, b) => b.localeCompare(a)).map(year => (
                  <div key={year} className="mt-2">
                    <button
                      onClick={() => toggleFolder(`year-${year}`)}
                      className="flex items-center gap-2 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600 font-semibold text-xs"
                    >
                      {expandedFolders.has(`year-${year}`) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <Folder size={16} className="text-amber-400 fill-amber-50" />
                      {year}
                    </button>
                    
                    {expandedFolders.has(`year-${year}`) && (
                      <div className="ml-6">
                        {Object.keys(diaryTree[year]).map(month => (
                          <div key={month} className="mt-1">
                            <button
                              onClick={() => toggleFolder(`month-${year}-${month}`)}
                              className="flex items-center gap-2 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500 font-medium text-xs"
                            >
                              {expandedFolders.has(`month-${year}-${month}`) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              <Folder size={14} className="text-amber-300 fill-amber-50" />
                              {month}
                            </button>
                            
                            {expandedFolders.has(`month-${year}-${month}`) && (
                              <div className="ml-6 space-y-1 mt-1">
                                {diaryTree[year][month].map((entry: DiaryEntry) => (
                                  <div key={entry.id} className="group flex items-center gap-2 p-2 hover:bg-blue-50 rounded-xl transition-all">
                                    <button onClick={() => toggleSelection(entry.id)} className="text-slate-300 hover:text-blue-500 transition-colors">
                                      {isSelected(entry.id) ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} />}
                                    </button>
                                    <button
                                      onClick={() => onSelectEntry(entry)}
                                      className="flex-1 flex items-center gap-2 text-left text-xs text-slate-600"
                                    >
                                      <FileText size={14} className="text-blue-400" />
                                      <span className="truncate">{format(new Date(entry.date), 'dd.MM.yyyy')} - {entry.content.substring(0, 30)}...</span>
                                    </button>
                                    <div className="hidden group-hover:flex items-center gap-1">
                                      <button onClick={() => onExportPDF(entry)} className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all" title="Als PDF exportieren">
                                        <Download size={14} />
                                      </button>
                                      <button onClick={() => onDeleteEntry(entry.id)} className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-all" title="Löschen">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Documents Folder */}
        <div>
          <button
            onClick={() => toggleFolder('documents')}
            className="flex items-center gap-2 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-sm"
          >
            {expandedFolders.has('documents') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder size={18} className="text-emerald-500 fill-emerald-50" />
            Dokumente
          </button>
          
          <AnimatePresence>
            {expandedFolders.has('documents') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-6 overflow-hidden mt-2 space-y-1"
              >
                {documents.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic p-2">Keine Dokumente vorhanden.</p>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="group flex items-center gap-2 p-2 hover:bg-emerald-50 rounded-xl transition-all">
                      <button onClick={() => toggleSelection(doc.id)} className="text-slate-300 hover:text-emerald-500 transition-colors">
                        {isSelected(doc.id) ? <CheckSquare size={14} className="text-emerald-500" /> : <Square size={14} />}
                      </button>
                      <div className="flex-1 flex items-center gap-2 text-xs text-slate-600">
                        <File size={14} className="text-emerald-400" />
                        <span className="truncate">{doc.name}</span>
                        <span className="text-[9px] text-slate-400">({(doc.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={() => window.open(doc.url, '_blank')} className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-emerald-600 transition-all" title="Herunterladen">
                          <Download size={14} />
                        </button>
                        <button onClick={() => onDeleteDocument(doc)} className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-all" title="Löschen">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
