"use client";

import { Send, Paperclip, Smile } from "lucide-react";
import { useState, useRef } from "react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Aa",
}: MessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-3 sm:p-4 border-t bg-white flex gap-2 sm:gap-3 flex-shrink-0"
    >
      <button
        type="button"
        className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
      >
        <Paperclip size={20} className="text-gray-600" />
      </button>

      <div className="flex-1 flex items-end gap-2 overflow-hidden">
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e as any);
            }
          }}
          placeholder={placeholder}
          rows={1}
          className="flex-1 px-3 py-2 border rounded-2xl text-sm resize-none outline-none  max-h-24 overflow-y-auto"
        />
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
        >
          <Smile size={20} className="text-gray-600" />
        </button>
      </div>

      <button
        type="submit"
        disabled={!value.trim() || isLoading}
        className="p-2 bg-blue-900 text-white rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition active:scale-95"
      >
        <Send size={20} />
      </button>
    </form>
  );
}
