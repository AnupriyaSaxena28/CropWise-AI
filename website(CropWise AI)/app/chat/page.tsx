/**
 * app/chat/page.tsx
 * AI Chat page — server component shell.
 * Delegates all interactivity to ChatInterface (client component).
 *
 * NOTE: The AppShell is NOT used here because the chat page has its own
 * full-height layout (sidebar + main). We use a stripped layout instead.
 */

import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import ChatInterface from "@/components/chat/ChatInterface";

export const metadata: Metadata = {
  title: "AI Chat — CropWise AI",
  description: "Talk to your AI-powered crop advisor",
};

export default function ChatPage() {
  return (
    <AppShell>
      <ChatInterface />
    </AppShell>
  );
}