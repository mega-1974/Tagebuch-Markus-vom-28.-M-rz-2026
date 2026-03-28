import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { AISummary } from '../types';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { toast } from 'sonner';

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
      console.error('Error fetching summaries:', error);
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
      console.error('Error saving summary:', error);
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
      console.error('Error deleting summary:', error);
      toast.error('Fehler beim Verschieben in den Papierkorb');
    }
  };

  return { summaries, loading, saveSummary, deleteSummary };
};
