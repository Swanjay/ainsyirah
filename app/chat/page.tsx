"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const MODELS = [
  { key: "kr/deepseek-3.2", label: "🔮 DeepSeek 3.2 (cepat & ringan)", default: true },
  { key: "kr/claude-sonnet-4.5", label: "🧠 Claude Sonnet 4.5 (terbaik)" },
  { key: "kr/claude-haiku-4.5", label: "⚡ Claude Haiku 4.5 (paling ringan)" },
  { key: "kr/claude-sonnet-4", label: "💬 Claude Sonnet 4" },
  { key: "kr/minimax-m2.5", label: "✨ MiniMax M2.5" },
  { key: "kr/glm-5", label: "🌟 GLM-5" },
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
    model: "mimo-flash",
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
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
  }, [input]);

  function newChat() {
    setMessages([GREETING]);
    setInput("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
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
    // Kalau server default dipilih, kosongkan custom
    if (!s.useCustom) {
      s.customBaseUrl = "";
      s.customApiKey = "";
    }
    setSettings(s);
    saveSettings(s);
    setShowSettings(false);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
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

  const suggestions = [
    "Jelaskan fotosintesis dengan sederhana",
    "Buatkan caption untuk postingan motivasi",
    "Terjemahkan 'semangat' ke bahasa Arab",
  ];

  const currentModelLabel = MODELS.find((m) => m.key === settings.model)?.label ?? settings.model;

  return (
    <div className="flex flex-col h-screen bg-[#faf6ef] text-[#3a352e]">
      {/* PANEL PENGATURAN (overlay) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
          <div className="bg-[#f6efe1] rounded-2xl shadow-xl border border-[#e8dcc4] w-full max-w-md p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[#2e2a23]">⚙️ Pengaturan AI</h2>

            {/* Pilihan Model */}
            <div>
              <label className="block text-sm font-medium text-[#7a6c4d] mb-1">Model AI</label>
              <select
                value={tempSettings.model}
                onChange={(e) => setTempSettings({ ...tempSettings, model: e.target.value })}
                className="w-full rounded-xl border border-[#e0d4bd] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#caa86a]"
              >
                {MODELS.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Toggle Server Pribadi */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTempSettings({ ...tempSettings, useCustom: !tempSettings.useCustom })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  tempSettings.useCustom ? "bg-[#caa86a]" : "bg-[#d5ccba]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    tempSettings.useCustom ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-sm text-[#3a352e]">Gunakan server pribadi</span>
            </div>

            {tempSettings.useCustom && (
              <div className="space-y-3 bg-white rounded-xl border border-[#e0d4bd] p-4">
                <div>
                  <label className="block text-xs text-[#7a6c4d] mb-1">Base URL server (contoh: http://192.168.1.100:20128/v1)</label>
                  <input
                    type="text"
                    value={tempSettings.customBaseUrl}
                    onChange={(e) => setTempSettings({ ...tempSettings, customBaseUrl: e.target.value })}
                    placeholder="http://IP-KAMU:PORT/v1"
                    className="w-full rounded-lg border border-[#e0d4bd] px-3 py-2 text-sm outline-none focus:border-[#caa86a] placeholder:text-[#bcae8e]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7a6c4d] mb-1">API Key (opsional)</label>
                  <input
                    type="password"
                    value={tempSettings.customApiKey}
                    onChange={(e) => setTempSettings({ ...tempSettings, customApiKey: e.target.value })}
                    placeholder="Ketik API key server kamu"
                    className="w-full rounded-lg border border-[#e0d4bd] px-3 py-2 text-sm outline-none focus:border-[#caa86a] placeholder:text-[#bcae8e]"
                  />
                </div>
                <p className="text-[11px] text-[#bcae8e]">
                  Data tersimpan di browser kamu saja — tidak dikirim ke server manapun selain server yang kamu isi di atas.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-[#7a6c4d] rounded-xl border border-[#e0d4bd] hover:bg-[#ece2cf] transition"
              >
                Batal
              </button>
              <button
                onClick={saveAndClose}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#caa86a] rounded-xl hover:bg-[#b8965a] transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center gap-3 px-5 py-4 border-b border-[#e8dcc4] bg-[#f6efe1]">
        <Link href="/" className="text-[#a99a78] hover:text-[#7a6c4d] text-sm">← Kembali</Link>
        <div className="flex items-center gap-2 ml-2 text-[#2e2a23]" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.125rem" }}>
          <span className="text-xl">🌙</span> A&apos;insyirah
        </div>
        <button
          onClick={openSettings}
          title="Pengaturan AI"
          className="ml-auto text-[#a99a78] hover:text-[#7a6c4d] text-lg leading-none transition px-2"
        >
          ⚙️
        </button>
        <button
          onClick={newChat}
          className="flex items-center gap-1.5 text-xs rounded-full border border-[#e0d4bd] bg-white px-3 py-1.5 text-[#7a6c4d] hover:bg-[#f3ead9] transition"
        >
          ✚ Chat Baru
        </button>
      </header>

      {/* PESAN */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`group flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#caa86a] text-white rounded-br-sm"
                  : "bg-white border border-[#ece2cf] text-[#3a352e] rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
            {m.role === "assistant" && i > 0 && (
              <button
                onClick={() => copyText(m.content, i)}
                className="mt-1 text-[11px] text-[#a99a78] hover:text-[#7a6c4d] opacity-0 group-hover:opacity-100 transition"
              >
                {copiedIdx === i ? "✓ Tersalin" : "⧉ Salin"}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#ece2cf] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-[#a99a78]">
              <span className="inline-flex gap-1">
                <span className="animate-pulse [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]">●</span>
                <span className="animate-pulse [animation-delay:0.2s] [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]">●</span>
                <span className="animate-pulse [animation-delay:0.4s] [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]">●</span>
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
              onClick={() => setInput(s)}
              className="text-xs rounded-full border border-[#e0d4bd] bg-[#f3ead9] px-3 py-1.5 text-[#7a6c4d] hover:bg-[#ece2cf] transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="border-t border-[#e8dcc4] bg-[#f6efe1] px-4 py-4">
        <div className="max-w-2xl w-full mx-auto flex gap-2 items-end">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ketik pesanmu... (Enter kirim, Shift+Enter baris baru)"
            className="flex-1 resize-none rounded-2xl bg-white border border-[#e0d4bd] px-5 py-3 text-[15px] outline-none placeholder:text-[#bcae8e] focus:border-[#caa86a] leading-relaxed"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-full bg-[#caa86a] text-white px-6 py-3 text-sm font-semibold hover:bg-[#b8965a] disabled:opacity-40 transition shrink-0"
          >
            Kirim
          </button>
        </div>
        <p className="max-w-2xl mx-auto text-center text-[11px] text-[#bcae8e] mt-2">
          {currentModelLabel} · Riwayat tersimpan di perangkatmu.
        </p>
      </div>
    </div>
  );
}
