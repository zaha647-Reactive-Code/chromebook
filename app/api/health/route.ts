import { adminDb, adminReady, adminReason } from '@/lib/firebase-admin';

/* GET /api/health — quick check that the server can reach Firebase.
   Shows only yes/no and a short error reason, never any key or password. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const out: Record<string, unknown> = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '(missing)',
    browserConfig: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    serverKeySet: !!(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64),
    serverKeyReadable: adminReady(),
  };
  if (!out.serverKeyReadable) out.problem = adminReason();
  else {
    try {
      const s = await adminDb().collection('products').limit(1).get();
      out.databaseOk = true; out.productsFound = !s.empty;
    } catch (e: any) {
      out.databaseOk = false;
      out.problem = String(e?.message || e).slice(0, 200);
    }
  }
  return Response.json(out, { headers: { 'cache-control': 'no-store' } });
}
