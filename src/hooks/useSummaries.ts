import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { AISummary } from '../types';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { toast } from 'sonner';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const useSummaries = (userId: string | undefined) => {
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSummaries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'summaries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as AISummary[];
      setSummaries(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'summaries');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const saveSummary = async (summaryData: Omit<AISummary, 'id'>) => {
    if (!userId) return;

    try {
      const summaryRef = doc(collection(db, 'summaries'));
      await setDoc(summaryRef, {
        ...summaryData,
        id: summaryRef.id
      });
      toast.success('Zusammenfassung gespeichert');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'summaries');
      toast.error('Fehler beim Speichern der Zusammenfassung');
    }
  };

  const deleteSummary = async (summaryId: string) => {
    if (!userId) return;

    try {
      const summary = summaries.find(s => s.id === summaryId);
      if (summary) {
        // Move to trash
        const trashRef = doc(collection(db, 'trash'));
        await setDoc(trashRef, {
          id: trashRef.id,
          userId,
          originalId: summaryId,
          type: 'summary',
          data: summary,
          originalPath: `summaries/${summaryId}`,
          deletedAt: new Date().toISOString()
        });

        await deleteDoc(doc(db, 'summaries', summaryId));
        toast.success('Zusammenfassung in den Papierkorb verschoben');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `summaries/${summaryId}`);
      toast.error('Fehler beim Verschieben in den Papierkorb');
    }
  };

  return { summaries, loading, saveSummary, deleteSummary };
};
