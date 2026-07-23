"use client";

import React from "react";
import { EXERMIND_CONFIG } from "@/config/exermind.config";

interface InputEsaiProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onIllegalAction?: (action: string) => void;
}

export default function InputEsai({
  value,
  onChange,
  placeholder = "Type your essay answer here...",
  disabled = false,
  onIllegalAction,
}: InputEsaiProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const handleCopyPaste = (e: React.ClipboardEvent, action: string) => {
    if (EXERMIND_CONFIG.ANTICHEAT_ACTIVE) {
      e.preventDefault();
      if (onIllegalAction) {
        onIllegalAction(action);
      }
    }
  };

  return (
    <div className="mt-6 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-orbitron text-xs font-semibold uppercase text-gray-400">
          Essay Answer Input
        </label>
        {EXERMIND_CONFIG.ANTICHEAT_ACTIVE && (
          <span className="font-orbitron text-[10px] text-yellow-400">
            Copy/Paste Disabled
          </span>
        )}
      </div>

      <div className="relative flex flex-col rounded-xl border border-gray-800 bg-[#111417] p-4 transition-all focus-within:border-[#88D6FA] focus-within:ring-1 focus-within:ring-[#88D6FA]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onCopy={(e) => handleCopyPaste(e, "COPY_ATTEMPT")}
          onPaste={(e) => handleCopyPaste(e, "PASTE_ATTEMPT")}
          onCut={(e) => handleCopyPaste(e, "CUT_ATTEMPT")}
          disabled={disabled}
          placeholder={placeholder}
          rows={8}
          className="w-full resize-y bg-transparent font-montserrat text-sm leading-relaxed text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
        />

        <div className="mt-3 flex items-center justify-between border-t border-gray-800/80 pt-2 font-montserrat text-xs text-gray-400">
          <div className="flex space-x-4">
            <span>
              Words: <strong className="text-white">{wordCount}</strong>
            </span>
            <span>
              Characters: <strong className="text-white">{charCount}</strong>
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">
            Auto-saved to draft
          </span>
        </div>
      </div>
    </div>
  );
}