import { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { DiaryDocument } from '../types';
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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { toast } from 'sonner';

export const useDocuments = (userId: string | undefined) => {
  const [documents, setDocuments] = useState<DiaryDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as DiaryDocument[];
      setDocuments(docs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching documents:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const uploadDocument = async (file: File) => {
    if (!userId) return;

    try {
      const fileId = Math.random().toString(36).substring(7);
      const storageRef = ref(storage, `users/${userId}/documents/${fileId}_${file.name}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      const docData: Omit<DiaryDocument, 'id'> = {
        userId,
        name: file.name,
        url,
        type: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'documents'), docData);
      toast.success('Datei erfolgreich hochgeladen');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Fehler beim Hochladen der Datei');
    }
  };

  const deleteDocument = async (document: DiaryDocument) => {
    if (!userId) return;

    try {
      // Move to trash
      const trashRef = doc(collection(db, 'trash'));
      await setDoc(trashRef, {
        userId,
        originalId: document.id,
        type: 'document',
        data: document,
        originalPath: `documents/${document.id}`,
        deletedAt: new Date().toISOString()
      });

      // Delete from firestore
      await deleteDoc(doc(db, 'documents', document.id));
      toast.success('Datei in den Papierkorb verschoben');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Fehler beim Verschieben in den Papierkorb');
    }
  };

  return { documents, loading, uploadDocument, deleteDocument };
};
