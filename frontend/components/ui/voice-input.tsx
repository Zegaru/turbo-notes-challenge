"use client";

import * as React from "react";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { useCallback, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectPositioner,
  SelectPopup,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
];

function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

type VoiceInputProps = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
};

export function VoiceInput({
  onTranscript,
  disabled = false,
  className = "",
}: VoiceInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTranscript = useCallback(
    (text: string) => {
      onTranscript(text);
    },
    [onTranscript]
  );

  const {
    isSupported,
    isListening,
    start,
    stop,
    error,
    lang,
    setLang,
  } = useSpeechRecognition({
    onTranscript: handleTranscript,
    lang: "en-US",
  });

  const handleToggleExpand = useCallback(() => {
    if (!isSupported || disabled) return;
    if (isExpanded) {
      stop();
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
      start();
    }
  }, [isSupported, disabled, isExpanded, start, stop]);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  if (!isSupported) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={handleToggleExpand}
        disabled={disabled}
        className={`group flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-border bg-note-yellow shadow-[4px_4px_0_0_#957139] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#957139] hover:bg-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none ${className}`}
        aria-label="Open Dictaphone"
      >
        <MicrophoneIcon className="h-7 w-7 text-border transition-transform duration-300 group-hover:scale-110" />
      </button>
    );
  }

  return (
    <div 
      className={`flex flex-col items-stretch overflow-hidden rounded-2xl border-[3px] border-border bg-bg shadow-[8px_8px_0_0_#957139] transition-all animate-in zoom-in-95 duration-300 ${className}`} 
      style={{ width: '280px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-[3px] border-border bg-border px-4 py-2.5 text-bg">
        <span className="font-heading text-sm font-black tracking-[0.2em] uppercase">
          Dictaphone
        </span>
        <button
          onClick={handleToggleExpand}
          className="hover:text-note-yellow transition-transform hover:rotate-90 duration-300"
          aria-label="Close Dictaphone"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="relative flex flex-col items-center justify-center gap-6 p-8 overflow-hidden bg-[radial-gradient(#957139_1px,transparent_1px)] bg-size-[12px_12px]">
        {/* Status */}
        <div className="text-center relative z-10 bg-bg/80 backdrop-blur-sm px-4 py-2 rounded-xl border-2 border-border shadow-[2px_2px_0_0_#957139]">
          <p className="font-heading text-2xl font-black text-border tracking-wide uppercase">
            {isListening ? "Recording" : "Standby"}
          </p>
          <p className="font-body text-xs font-bold text-border/70 mt-1 uppercase tracking-widest">
            {isListening ? "Speak Clearly" : "Press To Start"}
          </p>
        </div>

        {/* Big Record Button */}
        <button
          onClick={handleMicClick}
          className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-border transition-all duration-300 ${
            isListening 
              ? "bg-note-orange shadow-[inset_0_6px_12px_rgba(0,0,0,0.4)] scale-95" 
              : "bg-note-yellow shadow-[6px_6px_0_0_#957139] hover:bg-note-yellow/90 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#957139]"
          }`}
        >
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full border-4 border-note-orange animate-ping opacity-60" style={{ animationDuration: '1.5s' }} />
              <span className="absolute inset-0 rounded-full border-4 border-note-orange animate-ping opacity-30" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            </>
          )}
          <MicrophoneIcon className={`h-10 w-10 text-border ${isListening ? "animate-pulse text-white" : ""}`} />
        </button>
      </div>

      {/* Footer / Settings */}
      <div className="flex items-center justify-between border-t-[3px] border-border bg-note-sage px-4 py-3 relative z-10">
        <div className="flex items-center gap-3 w-full">
          <SettingsIcon className="h-5 w-5 text-border shrink-0" />
          <Select value={lang} onValueChange={(val) => { if (val) setLang(val); }}>
            <SelectTrigger className="flex-1 border-none px-0 py-0 bg-transparent font-heading text-sm font-black text-border uppercase tracking-widest hover:bg-transparent focus:ring-0 shadow-none justify-between h-auto min-h-0 data-placeholder:text-border [&>span:last-child]:text-border! [&>span:last-child>svg]:stroke-3! [&>span:last-child>svg]:w-5! [&>span:last-child>svg]:h-5!">
              <SelectValue>
                {(val: string) => {
                  const l = LANGUAGES.find((langItem) => langItem.value === val);
                  return l ? l.label : "Language";
                }}
              </SelectValue>
              <SelectIcon />
            </SelectTrigger>
            <SelectPortal>
              <SelectPositioner>
                <SelectPopup className="border-[3px] border-border rounded-xl shadow-[4px_4px_0_0_#957139] bg-bg min-w-[200px]">
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value} className="font-heading font-black text-sm text-border tracking-wider uppercase hover:bg-hover data-highlighted:bg-hover cursor-pointer py-2 transition-colors">
                      <SelectItemIndicator className="text-border" />
                      <SelectItemText>{l.label}</SelectItemText>
                    </SelectItem>
                  ))}
                </SelectPopup>
              </SelectPositioner>
            </SelectPortal>
          </Select>
        </div>
      </div>

      {error && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 w-[90%] rounded-lg border-[3px] border-border bg-note-orange px-3 py-2 text-center font-heading text-sm font-black text-border shadow-[4px_4px_0_0_#957139] animate-in slide-in-from-top-2">
          {error}
        </div>
      )}
    </div>
  );
}
