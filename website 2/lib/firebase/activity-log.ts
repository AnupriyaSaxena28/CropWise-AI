/**
 * lib/firebase/activity-log.ts
 * Firestore helpers for reading/writing activity logs.
 */

import {
  collection, addDoc, query, where, orderBy,
  limit, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { ActivityType } from "@/lib/firestore-schema";

export interface ActivityLogEntry {
  id?:         string;
  userId:      string;
  type:        ActivityType;
  title:       string;
  description: string;
  metadata:    Record<string, unknown>;
  createdAt?:  unknown;
}

// ─── Write an activity log entry (client-side) ────────────────────────────────

export async function logActivity(
  entry: Omit<ActivityLogEntry, "id" | "createdAt">
): Promise<void> {
  await addDoc(collection(db, "activityLogs"), {
    ...entry,
    createdAt: serverTimestamp(),
  });
}

// ─── Fetch recent activity logs for a user ────────────────────────────────────

export async function getUserActivityLogs(
  userId: string,
  maxItems = 20
): Promise<ActivityLogEntry[]> {
  const q = query(
    collection(db, "activityLogs"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: import('firebase/firestore').QueryDocumentSnapshot) => ({
    id: d.id,
    ...(d.data() as Omit<ActivityLogEntry, "id">),
  }));
}