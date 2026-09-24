// One-time, on a TRUSTED computer only (report 6.6): gives an account the admin role.
//   npm run make-admin -- owner@example.com
// The person must first create a normal account on the site, then sign out and in again after this.
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const who = process.argv[2];
if (!who) { console.error('Usage: npm run make-admin -- <email or user UID>'); process.exit(1); }
const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) { console.error('FIREBASE_SERVICE_ACCOUNT is missing from .env.local'); process.exit(1); }
const creds = JSON.parse(raw);
if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');
initializeApp({ credential: cert(creds) });
const auth = getAuth();
const user = who.includes('@') ? await auth.getUserByEmail(who) : await auth.getUser(who);
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
console.log(`Admin role added to ${user.email} (${user.uid}). Sign out and sign in again on the site.`);
