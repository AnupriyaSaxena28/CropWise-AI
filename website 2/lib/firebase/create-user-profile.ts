// lib/firebase/create-user-profile.ts

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";
import type { User } from "firebase/auth";

export async function createUserProfileIfNotExists(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  // Already exists — don't overwrite
  if (snap.exists()) return;

  // First login — create profile
  await setDoc(ref, {
    uid:               user.uid,
    email:             user.email ?? "",
    displayName:       user.displayName ?? "Farmer",
    photoURL:          user.photoURL ?? null,
    farmName:          "",
    location: {
      state:    "",
      district: "",
      pincode:  "",
    },
    landHolding:       0,
    primaryCrops:      [],
    preferredLanguage: "en",
    createdAt:         serverTimestamp(),
    updatedAt:         serverTimestamp(),
    lastLoginAt:       serverTimestamp(),
    isOnboarded:       false,
  });
}