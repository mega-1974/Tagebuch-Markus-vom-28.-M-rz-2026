/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DiaryEntry, Mood } from '../types';
import { localBackupService } from '../services/localBackupService';
import { db } from '../firebase';
import { toast } from 'sonner';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  collectionGroup,
  where
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: any, operation: OperationType, path: string) => {
  const errInfo = {
    error: error.message || String(error),
    operationType: operation,
    path,
    code: error.code
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  
  if (error.message && error.message.includes('the client is offline')) {
    toast.error('Firestore ist offline. Hast du die Datenbank in der Konsole erstellt?');
  } else if (error.code === 'failed-precondition') {
    toast.error('Ein Index fehlt in Firestore. Bitte erstelle den Index für Collection Group "entries".');
  } else {
    toast.error(`Fehler bei ${operation}: ${error.message || 'Unbekannter Fehler'}`);
  }
  
  throw new Error(JSON.stringify(errInfo));
};

export const useDiary = (userId: string | undefined) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    // Load from local storage first for immediate UI
    const localEntries = localBackupService.getEntries();
    setEntries(localEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    if (localEntries.length > 0) {
      setLoading(false);
    }

    // Setup Firestore listener using collectionGroup to find all 'entries' collections
    // Note: This requires a composite index in Firestore for collection group 'entries'
    // with fields: userId (Ascending) and date (Ascending).
    const q = query(
      collectionGroup(db, 'entries'),
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudEntries = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as DiaryEntry[];
      
      setEntries(cloudEntries);
      
      // Sync local storage with cloud data
      localStorage.setItem('mindful_path_entries', JSON.stringify(cloudEntries));
      setLoading(false);
    }, (error: any) => {
      console.error('Firestore Subscription Error:', error);
      if (error.message && error.message.includes('the client is offline')) {
        console.warn("Firestore is offline. Using local data fallback.");
        const localEntries = localBackupService.getEntries();
        setEntries(localEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      } else if (error.code === 'failed-precondition') {
        toast.error('Index erforderlich für Collection Group "entries".');
      } else {
        handleFirestoreError(error, OperationType.LIST, `collectionGroup(entries)`);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const getEntryPath = (date: string, entryId: string) => {
    const d = new Date(date);
    const year = d.getFullYear().toString();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    // Corrected path with 8 segments:
    // 1: users (coll) / 2: userId (doc) / 3: years (coll) / 4: year (doc) / 5: months (coll) / 6: month (doc) / 7: entries (coll) / 8: entryId (doc)
    return `users/${userId}/years/${year}/months/${month}/entries/${entryId}`;
  };

  const addEntry = async (entryData: Partial<DiaryEntry>) => {
    if (!userId) return;
    
    const entryId = Math.random().toString(36).substring(7);
    const date = entryData.date || new Date().toISOString();
    const newEntry: DiaryEntry = {
      id: entryId,
      userId,
      date,
      mood: entryData.mood || Mood.NEUTRAL,
      content: entryData.content!,
      tags: entryData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update local
    const currentEntries = [...entries];
    setEntries([...currentEntries, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    localBackupService.addEntry(newEntry);

    try {
      // Save to Firestore in folder structure: Mein Tagebuch -> Jahr -> Monat
      const path = getEntryPath(date, entryId);
      await setDoc(doc(db, path), newEntry);
    } catch (error: any) {
      if (error.message && error.message.includes('the client is offline')) {
        console.warn("Entry saved locally only (Firestore offline)");
        toast.info('Eintrag lokal gespeichert. Synchronisierung erfolgt später.');
      } else {
        handleFirestoreError(error, OperationType.CREATE, `folder_structure/${entryId}`);
      }
    }
  };

  const updateEntry = async (id: string, entryData: Partial<DiaryEntry>) => {
    if (!userId) return;
    
    const updatedData = {
      ...entryData,
      updatedAt: new Date().toISOString()
    };

    try {
      // Update local
      const localEntries = localBackupService.getEntries();
      const entry = localEntries.find(e => e.id === id) || entries.find(e => e.id === id);
      if (entry) {
        const fullEntry = { ...entry, ...updatedData };
        localBackupService.updateEntry(fullEntry);
        
        // Update Firestore
        // We need the original date to find the path
        const path = getEntryPath(entry.date, id);
        await updateDoc(doc(db, path), updatedData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `folder_structure/${id}`);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!userId) return;

    try {
      const localEntries = localBackupService.getEntries();
      const entry = localEntries.find(e => e.id === id) || entries.find(e => e.id === id);
      if (entry) {
        // Delete local
        localBackupService.deleteEntry(id);

        // Optimistic update
        setEntries(prev => prev.filter(e => e.id !== id));

        // Move to Trash
        const path = getEntryPath(entry.date, id);
        const trashRef = doc(collection(db, 'trash'));
        await setDoc(trashRef, {
          userId,
          originalId: id,
          type: 'entry',
          data: entry,
          originalPath: path,
          deletedAt: new Date().toISOString()
        });

        // Delete Firestore
        await deleteDoc(doc(db, path));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `folder_structure/${id}`);
    }
  };

  return { entries, loading, addEntry, updateEntry, deleteEntry };
};
