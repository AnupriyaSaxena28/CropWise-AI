/**
 * lib/firebase/chat-history.ts
 * Firestore helpers for chat sessions and messages.
 */

import {
  collection, addDoc, doc, updateDoc, getDoc,
  query, where, orderBy, limit, getDocs,
  serverTimestamp, increment,
} from "firebase/firestore";
import { db } from "./client";
import type { ChatMessage, ChatSession } from "@/app/chat/types";
import type { ChatMode } from "@/lib/firestore-schema";

// ─── Create a new chat session ────────────────────────────────────────────────

export async function createChatSession(
  userId: string,
  mode: ChatMode,
  title: string,
  language: string
): Promise<string> {
  const ref = await addDoc(collection(db, "chatHistory"), {
    userId,
    mode,
    title,
    language,
    messageCount: 0,
    createdAt:    serverTimestamp(),
    updatedAt:    serverTimestamp(),
  });
  return ref.id;
}

// ─── Save a message to a session ─────────────────────────────────────────────

export async function saveChatMessage(
  sessionId: string,
  message: Omit<ChatMessage, "id">
): Promise<string> {
  const msgRef = await addDoc(
    collection(db, "chatHistory", sessionId, "messages"),
    {
      ...message,
      createdAt: serverTimestamp(),
    }
  );
  // Increment denormalized counter + update session timestamp
  await updateDoc(doc(db, "chatHistory", sessionId), {
    messageCount: increment(1),
    updatedAt:    serverTimestamp(),
  });
  return msgRef.id;
}

// ─── Update session title ─────────────────────────────────────────────────────

export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<void> {
  await updateDoc(doc(db, "chatHistory", sessionId), { title });
}

// ─── Fetch sessions for a user ────────────────────────────────────────────────

export async function getUserChatSessions(
  userId: string,
  maxItems = 20
): Promise<ChatSession[]> {
  const q = query(
    collection(db, "chatHistory"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(maxItems)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: import('firebase/firestore').QueryDocumentSnapshot) => {
    const data = d.data();
    return {
      id:          d.id,
      title:       data.title ?? "Untitled Session",
      mode:        data.mode  ?? "general",
      lastMessage: "",
      updatedAt:   data.updatedAt?.toDate?.() ?? new Date(),
    } as ChatSession;
  });
}

// ─── Fetch messages for a session ────────────────────────────────────────────

export async function getSessionMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const q = query(
    collection(db, "chatHistory", sessionId, "messages"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: import('firebase/firestore').QueryDocumentSnapshot) => {
    const data = d.data();
    return {
      id:          d.id,
      role:        data.role,
      content:     data.content,
      diagnosisResult: data.diagnosisResult,
      imagePreviewUrl: data.imageUrl,
      createdAt:   data.createdAt?.toDate?.() ?? new Date(),
    } as ChatMessage;
  });
}