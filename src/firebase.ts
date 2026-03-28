/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with Long Polling for better compatibility in iframes
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test as per guidelines
async function testConnection() {
  try {
    // Try to fetch a non-existent document to test connection
    await getDocFromServer(doc(db, '_connection_test', 'test'));
    console.log("Firestore connection test successful");
  } catch (error: any) {
    if (error.message && error.message.includes('the client is offline')) {
      console.error("Firestore Error: The client is offline. This usually means the Firebase configuration is incorrect or the database hasn't been created in the console.");
    }
  }
}
testConnection();

// Export the app instance
export default app;
