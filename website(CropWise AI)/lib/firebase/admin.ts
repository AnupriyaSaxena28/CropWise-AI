/**
 * lib/firebase/admin.ts
 * Firebase ADMIN SDK — server-side only.
 * Never import this in client components.
 * Used in API Route Handlers for privileged Firestore writes.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function initAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // The private key contains escaped newlines from the env var — unescape them
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey,
    }),
  });
}

adminApp = initAdminApp();
adminDb = getFirestore(adminApp);
adminAuth = getAuth(adminApp);

export { adminApp, adminDb, adminAuth };