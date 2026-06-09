"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onResult, disabled }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
    }
  }, []);

  const toggle = useCallback(() => {
    if (!supported || disabled) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, supported, disabled, onResult]);

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      className="rounded-full flex items-center justify-center transition-all duration-200 shrink-0"
      style={{
        width: "44px",
        height: "44px",
        background: listening ? "#ef4444" : "var(--surface-solid)",
        border: `1px solid ${listening ? "#ef4444" : "var(--border)"}`,
        color: listening ? "#ffffff" : "var(--ink-secondary)",
        opacity: disabled ? 0.4 : 1,
      }}
      title={listening ? "Berhenti merekam" : "Bicara"}
    >
      {listening ? (
        <span className="flex items-center gap-0.5">
          <span className="inline-block w-1 h-3 bg-white rounded-full animate-pulse" />
          <span className="inline-block w-1 h-4 bg-white rounded-full animate-pulse [animation-delay:0.15s]" />
          <span className="inline-block w-1 h-3 bg-white rounded-full animate-pulse [animation-delay:0.3s]" />
        </span>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      )}
    </button>
  );
}
