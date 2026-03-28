import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const useCloudStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Listen to a dummy document to check connection
    const unsubscribe = onSnapshot(doc(db, '_connection_test', 'test'), 
      () => setIsConnected(true),
      (error) => {
        console.error("Cloud connection error:", error);
        setIsConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return isConnected;
};
