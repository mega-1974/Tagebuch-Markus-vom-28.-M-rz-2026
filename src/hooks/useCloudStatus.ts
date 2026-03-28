import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const useCloudStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Listen to a dummy document to check connection
    const unsubscribe = onSnapshot(
      doc(db, '_connection_test', 'test'), 
      { includeMetadataChanges: true },
      (snapshot) => {
        // If the data is coming from cache, we might be offline
        setIsConnected(!snapshot.metadata.fromCache);
      },
      (error) => {
        console.error("Cloud connection error:", error);
        setIsConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return isConnected;
};
