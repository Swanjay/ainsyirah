"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import ThemeToggle from "../components/ThemeToggle";
import VoiceInput from "../components/VoiceInput";

type Message = { role: "user" | "assistant"; content: string };

const MODELS = [
  // ⚡ Groq — super cepat
  { key: "groq/llama-3.1-8b", label: "⚡ Llama 3.1 8B — Cepat & Ringan", default: true },
  { key: "groq/llama-3.3-70b", label: "🧠 Llama 3.3 70B — Terbaik & Pintar" },
  { key: "groq/qwen3-32b", label: "🔮 Qwen3 32B — Coding & Logika" },
  { key: "groq/gpt-oss-120b", label: "✨ GPT-OSS 120B — OpenAI Open Source" },
  { key: "groq/llama-4-scout", label: "🚀 Llama 4 Scout 17B — Terbaru Meta" },
  { key: "groq/gpt-oss-20b", label: "💫 GPT-OSS 20B — Ringan & Cepat" },
  // 🆓 OpenRouter — model besar gratis
  { key: "or/hermes-405b", label: "🌟 Hermes 3 405B — Terpintar (OpenRouter)" },
  { key: "or/qwen3-coder", label: "🛠️ Qwen3 Coder 480B — Coding Terbaik (OpenRouter)" },
  { key: "or/kimi-k2.6", label: "🌙 Kimi K2.6 — MoonshotAI (OpenRouter)" },
  { key: "or/nemotron-ultra", label: "💎 Nemotron Ultra 550B — NVIDIA (OpenRouter)" },
  { key: "or/gemma-4-31b", label: "🌈 Gemma 4 31B — Google (OpenRouter)" },
  { key: "or/llama-3.3-70b", label: "🦙 Llama 3.3 70B — Meta (OpenRouter)" },
];

const GREETING: Message = {
  role: "assistant",
  content:
    "Assalamu'alaikum 🌙 Aku A'insyirah, asisten AI-mu. Tanya apa saja — pelajaran, menulis, terjemah, atau sekadar ngobrol. Ada yang bisa kubantu?",
};

const STORAGE_KEY = "ainsyirah_chat";
const SETTINGS_KEY = "ainsyirah_settings";

type Settings = {
  model: string;
  customBaseUrl: string;
  customApiKey: string;
  useCustom: boolean;
};

function loadSettings(): Settings {
  const defaults: Settings = {
    model: "groq/llama-3.1-8b",
    customBaseUrl: "",
    customApiKey: "",
    useCustom: false,
  };
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (s) return { ...defaults, ...JSON.parse(s) };
  } catch {}
  return defaults;
}

function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
};

const input = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--ink)",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<Settings>(settings);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + "px";
    }
  }, [inputText]);

  function newChat() {
    setMessages([GREETING]);
    setInputText("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function clearChat() {
    if (messages.length > 1) {
      if (!confirm("Hapus semua chat? Riwayat akan dihapus permanen.")) return;
    }
    newChat();
  }

  async function copyText(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  }

  function openSettings() {
    setTempSettings(settings);
    setShowSettings(true);
  }

  function saveAndClose() {
    const s = { ...tempSettings };
    if (!s.useCustom) {
      s.customBaseUrl = "";
      s.customApiKey = "";
    }
    setSettings(s);
    saveSettings(s);
    setShowSettings(false);
  }

  async function sendMessage() {
    const text = inputText.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          model: settings.model,
          ...(settings.useCustom
            ? { customBaseUrl: settings.customBaseUrl, customApiKey: settings.customApiKey }
            : {}),
        }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "Maaf, ada gangguan. Coba lagi ya.",
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Gagal terhubung ke server. Coba lagi sebentar." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const onVoiceResult = useCallback((text: string) => {
    setInputText((prev) => (prev ? prev + " " + text : text));
    taRef.current?.focus();
  }, []);

  const suggestions = [
    "Jelaskan fotosintesis dengan sederhana",
    "Buatkan caption untuk postingan motivasi",
    "Terjemahkan 'semangat' ke bahasa Arab",
  ];

  const currentModelLabel = MODELS.find((m) => m.key === settings.model)?.label ?? settings.model;

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {/* PANEL PENGATURAN (overlay) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5" style={{ ...card, background: "var(--surface-elevated)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>⚙️ Pengaturan AI</h2>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>Model AI</label>
              <select
                value={tempSettings.model}
                onChange={(e) => setTempSettings({ ...tempSettings, model: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ ...input, borderRadius: "var(--radius-md)" }}
              >
                {MODELS.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTempSettings({ ...tempSettings, useCustom: !tempSettings.useCustom })}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: tempSettings.useCustom ? "var(--gold)" : "var(--border)" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform"
                  style={{ background: "var(--surface-solid)", transform: tempSettings.useCustom ? "translateX(20px)" : "none" }}
                />
              </button>
              <span className="text-sm" style={{ color: "var(--ink)" }}>Gunakan server pribadi</span>
            </div>

            {tempSettings.useCustom && (
              <div className="space-y-3 p-4" style={{ ...card }}>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--ink-secondary)" }}>Base URL server</label>
                  <input
                    type="text"
                    value={tempSettings.customBaseUrl}
                    onChange={(e) => setTempSettings({ ...tempSettings, customBaseUrl: e.target.value })}
                    placeholder="http://IP-KAMU:PORT/v1"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ ...input, borderRadius: "var(--radius-sm)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--ink-secondary)" }}>API Key (opsional)</label>
                  <input
                    type="password"
                    value={tempSettings.customApiKey}
                    onChange={(e) => setTempSettings({ ...tempSettings, customApiKey: e.target.value })}
                    placeholder="Ketik API key server kamu"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ ...input, borderRadius: "var(--radius-sm)" }}
                  />
                </div>
                <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
                  Data tersimpan di browser kamu saja.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm rounded-xl transition"
                style={{ color: "var(--ink-secondary)", border: "1px solid var(--border)" }}
              >
                Batal
              </button>
              <button
                onClick={saveAndClose}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
                style={{ background: "var(--gold)" }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--header-bg)" }}>
        <Link href="/" className="text-sm hover:opacity-80 transition" style={{ color: "var(--ink-muted)" }}>← Kembali</Link>
        <div className="flex items-center gap-2 ml-2" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.125rem", color: "var(--ink)" }}>
          <span className="text-xl">🌙</span> A&apos;insyirah
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={openSettings}
            title="Pengaturan AI"
            className="text-lg leading-none transition px-2 hover:opacity-80"
            style={{ color: "var(--ink-muted)" }}
          >
            ⚙️
          </button>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 transition hover:opacity-80"
            style={{ ...card, color: "var(--ink-secondary)" }}
            title="Hapus semua chat"
          >
            🗑️ Hapus
          </button>
        </div>
      </header>

      {/* PESAN */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`group flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap"
              style={{
                background: m.role === "user" ? "var(--chat-user-bg)" : "var(--chat-bot-bg)",
                color: m.role === "user" ? "var(--chat-user-text)" : "var(--chat-bot-text)",
                border: m.role === "assistant" ? "1px solid var(--chat-bot-border)" : "none",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              }}
            >
              {m.content}
            </div>
            {m.role === "assistant" && i > 0 && (
              <button
                onClick={() => copyText(m.content, i)}
                className="mt-1 text-[11px] opacity-0 group-hover:opacity-100 transition"
                style={{ color: "var(--ink-muted)" }}
              >
                {copiedIdx === i ? "✓ Tersalin" : "⧉ Salin"}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm" style={{ background: "var(--chat-bot-bg)", border: "1px solid var(--chat-bot-border)", color: "var(--ink-muted)" }}>
              <span className="inline-flex gap-1">
                <span className="animate-pulse" style={{ animationTimingFunction: "var(--ease-out-expo)" }}>●</span>
                <span className="animate-pulse [animation-delay:0.2s]" style={{ animationTimingFunction: "var(--ease-out-expo)" }}>●</span>
                <span className="animate-pulse [animation-delay:0.4s]" style={{ animationTimingFunction: "var(--ease-out-expo)" }}>●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* SARAN CEPAT */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 max-w-2xl w-full mx-auto flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInputText(s)}
              className="text-xs rounded-full px-3 py-1.5 transition hover:opacity-80"
              style={{ ...card, color: "var(--suggestion-text)" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--border)", background: "var(--header-bg)" }}>
        <div className="max-w-2xl w-full mx-auto flex gap-2 items-end">
          <textarea
            ref={taRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ketik pesanmu... (Enter kirim, Shift+Enter baris baru)"
            className="flex-1 resize-none rounded-2xl px-5 py-3 text-[15px] outline-none leading-relaxed"
            style={{ ...input, borderRadius: "16px" }}
          />
          <VoiceInput onResult={onVoiceResult} disabled={loading} />
          <button
            onClick={sendMessage}
            disabled={loading || !inputText.trim()}
            className="rounded-full text-white px-6 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition shrink-0"
            style={{ background: "var(--gold)" }}
          >
            Kirim
          </button>
        </div>
        <p className="max-w-2xl mx-auto text-center text-[11px] mt-2" style={{ color: "var(--ink-muted)" }}>
          {currentModelLabel} · Riwayat tersimpan di perangkatmu.
        </p>
      </div>
    </div>
  );
}
