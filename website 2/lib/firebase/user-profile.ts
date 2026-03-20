/**
 * lib/firebase/user-profile.ts
 * Firestore helpers for user profile read/write.
 */

import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { User } from "firebase/auth";
import type { FirestoreUser } from "@/lib/firestore-schema";

// ─── Create profile on first login ───────────────────────────────────────────

export async function createUserProfileIfNotExists(user: User): Promise<void> {
  const ref  = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    // Just update lastLoginAt
    await updateDoc(ref, { lastLoginAt: serverTimestamp() });
    return;
  }
  await setDoc(ref, {
    uid:               user.uid,
    email:             user.email ?? "",
    displayName:       user.displayName ?? "Farmer",
    photoURL:          user.photoURL ?? null,
    farmName:          "",
    location:          { state: "", district: "", pincode: "" },
    landHolding:       0,
    primaryCrops:      [],
    preferredLanguage: "en",
    createdAt:         serverTimestamp(),
    updatedAt:         serverTimestamp(),
    lastLoginAt:       serverTimestamp(),
    isOnboarded:       false,
  } satisfies Omit<FirestoreUser, "createdAt" | "updatedAt" | "lastLoginAt"> & Record<string, unknown>);
}

// ─── Get user profile ─────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as FirestoreUser) : null;
}

// ─── Update user profile ──────────────────────────────────────────────────────

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<FirestoreUser, "uid" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}