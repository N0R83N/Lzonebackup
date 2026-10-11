import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use long polling for Firestore to avoid some network issues in iframes
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Ensure persistence is set
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Connection test as per instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('network-request-failed'))) {
      console.warn("Firebase connection issue detected. This is often due to third-party cookies being blocked in the browser.");
    }
  }
}
testConnection();
