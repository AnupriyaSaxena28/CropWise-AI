/**
 * components/chat/ChatInputBar.tsx
 * Rich input bar at the bottom of the chat.
 * Features: image attach (AI image analysis), file clip, voice mic, send button.
 * Matches the design screenshot exactly.
 */

"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  ImagePlus,
  Paperclip,
  Mic,
  Send,
  X,
  Loader2,
} from "lucide-react";
import { cn, fileToBase64, getImageMimeType } from "@/lib/utils";

// ─── Component ────────────────────────────────────────────────────────────────

interface ChatInputBarProps {
  onSend: (text: string, image?: { base64: string; mimeType: string; previewUrl: string }) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInputBar({
  onSend,
  isLoading,
  disabled = false,
  placeholder = "Ask about soil health, pest control, or yields...",
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Image selection ───────────────────────────────────────────
  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const previewUrl = URL.createObjectURL(file);
    const base64 = await fileToBase64(file);
    const mimeType = getImageMimeType(file);

    setImagePreview(previewUrl);
    setImageData({ base64, mimeType });
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageData(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ── Send ──────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !imageData) return;
    if (isLoading) return;

    onSend(
      trimmed || "Please diagnose the disease in this image.",
      imageData && imagePreview
        ? { ...imageData, previewUrl: imagePreview }
        : undefined
    );

    setText("");
    clearImage();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // ── Enter to send (Shift+Enter = newline) ─────────────────────
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Auto-resize textarea ──────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  };

  const canSend = (text.trim().length > 0 || imageData !== null) && !isLoading && !disabled;

  return (
    <div className="px-4 md:px-6 pb-4 pt-2">
      {/* ── Image preview strip ────────────────────────────────── */}
      {imagePreview && (
        <div className="mb-2 flex items-start gap-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Image to analyse"
              className="h-20 w-20 object-cover rounded-xl border border-[#2a3d2c]"
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#0b1410] border border-[#2a3d2c] flex items-center justify-center text-[#94a896] hover:text-rose-400 transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
          <span className="text-xs text-[#5a7460] mt-2">
            Image attached — AI will analyse it
          </span>
        </div>
      )}

      {/* ── Input container ────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-end gap-2 px-3 py-2.5 rounded-2xl border transition-colors duration-150",
          "bg-[#0d1a10] border-[#2a3d2c]",
          "focus-within:border-[#3d5c40]"
        )}
      >
        {/* Left actions */}
        <div className="flex items-center gap-1 pb-0.5">
          {/* AI image analysis */}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            className="p-1.5 rounded-lg text-[#5a7460] hover:text-[#4dc24d] hover:bg-[#1f2f21] transition-all disabled:opacity-40"
            title="Attach image for AI analysis"
          >
            <ImagePlus className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>

          {/* File clip */}
          <button
            disabled={disabled}
            className="p-1.5 rounded-lg text-[#5a7460] hover:text-[#94a896] hover:bg-[#1f2f21] transition-all disabled:opacity-40"
            title="Attach file"
          >
            <Paperclip className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={cn(
            "flex-1 bg-transparent text-sm text-[#e8f5e9] placeholder:text-[#3d4d3e]",
            "outline-none resize-none leading-relaxed py-0.5",
            "disabled:opacity-50",
            "min-h-[24px] max-h-[140px]"
          )}
        />

        {/* Right actions */}
        <div className="flex items-center gap-1 pb-0.5">
          {/* Voice (placeholder) */}
          <button
            disabled={disabled}
            className="p-1.5 rounded-lg text-[#5a7460] hover:text-[#94a896] hover:bg-[#1f2f21] transition-all disabled:opacity-40"
            title="Voice input (coming soon)"
          >
            <Mic className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "p-2 rounded-xl transition-all duration-150 active:scale-95",
              canSend
                ? "bg-[#2ea82e] text-[#0b1410] hover:bg-[#35c435] shadow-[0_2px_8px_rgba(46,168,46,0.3)]"
                : "bg-[#182419] text-[#3d4d3e] cursor-not-allowed"
            )}
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {/* ── Footer note ────────────────────────────────────────── */}
      <p className="text-center text-[10px] text-[#3d4d3e] mt-2 flex items-center justify-center gap-1">
        <span className="w-1 h-1 rounded-full bg-[#2ea82e] inline-block" />
        AI analysis backed by regional agricultural datasets
      </p>

      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageSelect(file);
        }}
      />
    </div>
  );
}