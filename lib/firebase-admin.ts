import 'server-only';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

/* Server-side Firebase. Uses the secret service-account key from the
   FIREBASE_SERVICE_ACCOUNT environment variable (never in the browser, never in git).
   During local testing it can also talk to the Firebase Emulator Suite. */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chromebook-site';
const usingEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

let app: App | null = null;
let reason = '';

function init(): App | null {
  if (app) return app;
  if (getApps().length) { app = getApps()[0]; return app; }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  try {
    if (raw && raw.trim()) {
      const creds = JSON.parse(raw);
      if (creds.private_key) creds.private_key = String(creds.private_key).replace(/\\n/g, '\n');
      app = initializeApp({
        credential: cert(creds),
        projectId: creds.project_id || PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else if (usingEmulator) {
      app = initializeApp({ projectId: PROJECT_ID, storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET });
    } else {
      reason = 'FIREBASE_SERVICE_ACCOUNT is not set in .env.local (or in the hosting settings).';
      return null;
    }
  } catch (e: any) {
    reason = 'FIREBASE_SERVICE_ACCOUNT could not be read: ' + (e?.message || e);
    return null;
  }
  return app;
}

export const adminReady = () => !!init();
export const adminReason = () => { init(); return reason; };

export function adminDb(): Firestore {
  const a = init();
  if (!a) throw new Error('Firebase is not connected. ' + reason);
  return getFirestore(a);
}
export function adminAuth(): Auth {
  const a = init();
  if (!a) throw new Error('Firebase is not connected. ' + reason);
  return getAuth(a);
}
export function adminBucket() {
  const a = init();
  if (!a) throw new Error('Firebase is not connected. ' + reason);
  return getStorage(a).bucket();
}
