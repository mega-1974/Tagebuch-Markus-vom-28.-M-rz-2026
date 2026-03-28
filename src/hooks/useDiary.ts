/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';
import { localBackupService } from '../services/localBackupService';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc
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
    setEntries(localEntries);

    // Setup Firestore listener
    const q = query(
      collection(db, 'users', userId, 'entries'),
      orderBy('date', 'desc')
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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/entries`);
    });

    return () => unsubscribe();
  }, [userId]);

  const addEntry = async (entryData: Partial<DiaryEntry>) => {
    if (!userId) return;
    
    const entryId = Math.random().toString(36).substring(7);
    const newEntry: DiaryEntry = {
      id: entryId,
      userId,
      date: entryData.date || new Date().toISOString(),
      mood: entryData.mood!,
      content: entryData.content!,
      tags: entryData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Optimistic update local
      localBackupService.addEntry(newEntry);
      
      // Save to Firestore
      await setDoc(doc(db, 'users', userId, 'entries', entryId), newEntry);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/entries/${entryId}`);
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
      const entry = localEntries.find(e => e.id === id);
      if (entry) {
        localBackupService.updateEntry({ ...entry, ...updatedData });
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', userId, 'entries', id), updatedData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/entries/${id}`);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!userId) return;

    try {
      // Delete local
      localBackupService.deleteEntry(id);

      // Delete Firestore
      await deleteDoc(doc(db, 'users', userId, 'entries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/entries/${id}`);
    }
  };

  return { entries, loading, addEntry, updateEntry, deleteEntry };
};
