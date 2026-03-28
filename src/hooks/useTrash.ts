import { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { TrashItem } from '../types';
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
import { ref, deleteObject } from 'firebase/storage';
import { toast } from 'sonner';

export const useTrash = (userId: string | undefined) => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTrashItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'trash'),
      where('userId', '==', userId),
      orderBy('deletedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as TrashItem[];
      setTrashItems(items);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching trash:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const restoreItem = async (item: TrashItem) => {
    if (!userId) return;

    try {
      // Restore to original path
      await setDoc(doc(db, item.originalPath), item.data);
      // Delete from trash
      await deleteDoc(doc(db, 'trash', item.id));
      toast.success('Element wiederhergestellt');
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Fehler beim Wiederherstellen');
    }
  };

  const permanentlyDeleteItem = async (item: TrashItem) => {
    if (!userId) return;

    try {
      // If it's a document, delete from storage
      if (item.type === 'document' && item.data.url) {
        try {
          const storageRef = ref(storage, item.data.url);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Continue deleting from firestore even if storage fails (e.g., already deleted)
        }
      }

      // Delete from trash
      await deleteDoc(doc(db, 'trash', item.id));
      toast.success('Element endgültig gelöscht');
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast.error('Fehler beim endgültigen Löschen');
    }
  };

  const emptyTrash = async () => {
    if (!userId) return;
    
    try {
      // We can't easily batch delete with storage files, so we loop
      for (const item of trashItems) {
        await permanentlyDeleteItem(item);
      }
      toast.success('Papierkorb geleert');
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('Fehler beim Leeren des Papierkorbs');
    }
  };

  return { trashItems, loading, restoreItem, permanentlyDeleteItem, emptyTrash };
};
