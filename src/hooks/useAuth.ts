/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth, googleProvider, db } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Optimistically set user to unblock UI immediately
        const optimisticUser: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Nutzer',
          photoURL: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200/200`,
          createdAt: new Date().toISOString(),
        };
        setUser(optimisticUser);
        setLoading(false);

        // Check if user profile exists in Firestore in the background
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // Create new user profile
            await setDoc(userDocRef, optimisticUser);
          }
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          if (error.message && error.message.includes('the client is offline')) {
            // We already set the optimistic user, so just show a toast
            toast.error('Firestore ist offline. Daten werden aktuell nur lokal gespeichert.');
          }
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    }, (error: any) => {
      console.error('Auth state change error:', error);
      if (error.message && error.message.includes('the client is offline')) {
        toast.error('Verbindung zu Firestore fehlgeschlagen. Bitte prüfe deine Firebase-Konfiguration.');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        toast.success('Erfolgreich angemeldet');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Das Anmeldefenster wurde blockiert. Bitte erlaube Popups für diese Seite.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Google Login ist in Firebase noch nicht aktiviert.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Diese Domain ist in Firebase noch nicht autorisiert.');
      } else {
        toast.error('Anmeldung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Abgemeldet');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Abmeldung fehlgeschlagen');
      throw error;
    }
  };

  return { user, loading, signIn, signOut };
};
