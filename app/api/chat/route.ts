// Backend A'insyirah — menghubungkan chat ke API AI.
// Provider 1: Groq (primary, fast, free tier)
// Provider 2: Pollinations (backup, free, no key)
// Provider 3: Alpakyros (backup, needs key)

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

import { readFileSync } from "fs";
import { join } from "path";

// API keys: prioritas ENV variable (Vercel), fallback ke file lokal
let _groqKey = process.env.GROQ_API_KEY ?? "";
let _alpakyrosKey = process.env.ALPAYKROS_KEY ?? "";

if (!_groqKey || !_alpakyrosKey) {
  try {
    const envContent = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of envContent.split("\n")) {
      const [k, ...v] = line.split("=");
      const val = v.join("=").trim();
      if (k?.trim() === "GROQ_API_KEY" && !_groqKey) _groqKey = val;
      if (k?.trim() === "ALPAYKROS_KEY" && !_alpakyrosKey) _alpakyrosKey = val;
    }
  } catch {}
}

// Daftar "kepribadian" asisten
const PERSONAS: Record<string, string> = {
  umum:
    "Kamu adalah A'insyirah, asisten AI ramah berbahasa Indonesia. " +
    "Kamu membantu menjawab pertanyaan umum, menulis, menerjemahkan, menjelaskan " +
    "pelajaran, dan memberi ide. Jawab dengan jelas, sopan, dan mudah dipahami. " +
    "Gunakan bahasa sehari-hari. Sesekali boleh memberi semangat yang positif.",
  belajar:
    "Kamu adalah A'insyirah dalam Mode Belajar — seperti guru privat yang sabar. " +
    "Jelaskan konsep dengan langkah-langkah sederhana, gunakan analogi sehari-hari, " +
    "dan beri contoh. Hindari istilah rumit; kalau terpaksa pakai, jelaskan artinya. " +
    "Akhiri dengan pertanyaan singkat untuk memastikan pengguna paham.",
  nulis:
    "Kamu adalah A'insyirah dalam Mode Menulis — asisten kreatif. " +
    "Bantu membuat caption, artikel, surat, atau teks lain yang menarik dan rapi. " +
    "Tawarkan beberapa variasi bila relevan, dan sesuaikan gaya bahasa dengan permintaan.",
  islami:
    "Kamu adalah A'insyirah dalam Mode Islami — asisten yang santun dan bernuansa religius. " +
    "Jawab dengan adab Islami, boleh menyertakan dalil (ayat/hadis) bila relevan dan kamu yakin " +
    "kebenarannya, serta sebutkan sumbernya. Jika tidak yakin pada suatu dalil, katakan dengan jujur " +
    "dan sarankan merujuk pada ustadz/sumber terpercaya. Tetap ramah dan memberi semangat.",
};

// Map model frontend → Groq model name
function toGroqModel(modelKey: string): string {
  const map: Record<string, string> = {
    "groq/llama-3.1-8b": "llama-3.1-8b-instant",
    "groq/llama-3.3-70b": "llama-3.3-70b-versatile",
    "groq/qwen3-32b": "qwen/qwen3-32b",
    "groq/gpt-oss-120b": "openai/gpt-oss-120b",
    "groq/llama-4-scout": "meta-llama/llama-4-scout-17b-16e-instruct",
    "groq/gpt-oss-20b": "openai/gpt-oss-20b",
  };
  return map[modelKey] ?? "llama-3.1-8b-instant";
}

// === PROVIDER 1: Groq (primary) ===
async function askGroq(
  messages: ChatMessage[],
  systemPrompt: ChatMessage,
  modelKey: string,
): Promise<string | null> {
  if (!_groqKey) return null;
  const model = toGroqModel(modelKey);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_groqKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) {
        console.log(`OK via Groq/${model}`);
        return reply;
      }
    } else {
      const errText = await res.text().catch(() => "");
      console.error(`Groq error: ${res.status} ${errText.slice(0, 150)}`);
    }
  } catch (err) {
    console.error(`Groq failed:`, err);
  }
  return null;
}

// === PROVIDER 2: Pollinations (backup, free, no key) ===
async function askPollinations(
  messages: ChatMessage[],
  systemPrompt: ChatMessage,
): Promise<string | null> {
  try {
    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [systemPrompt, ...messages],
      }),
    });
    if (res.ok) {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) return reply;
      } catch {
        if (text && !text.includes('"error"')) return text.trim();
      }
    }
  } catch {}
  return null;
}

// === PROVIDER 3: Alpakyros (backup) ===
async function askAlpakyros(
  messages: ChatMessage[],
  systemPrompt: ChatMessage,
  modelKey: string,
): Promise<string | null> {
  if (!_alpakyrosKey) return null;
  try {
    const res = await fetch("https://api.alpakyros.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_alpakyrosKey}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: modelKey,
        messages: [systemPrompt, ...messages],
        stream: false,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) return reply;
    }
  } catch {}
  return null;
}

// Main: Groq → Pollinations → Alpakyros
async function askAI(messages: ChatMessage[], persona: string, chosenModel?: string): Promise<string | null> {
  const systemPrompt: ChatMessage = {
    role: "system",
    content: PERSONAS[persona] ?? PERSONAS.umum,
  };
  const model = chosenModel ?? "kr/deepseek-3.2";

  // 1) Groq (primary — fast, reliable)
  const groqResult = await askGroq(messages, systemPrompt, model);
  if (groqResult) return groqResult;

  // 2) Pollinations (backup — free, no key)
  const pollResult = await askPollinations(messages, systemPrompt);
  if (pollResult) return pollResult;

  // 3) Alpakyros (backup — needs key)
  const alpaResult = await askAlpakyros(messages, systemPrompt, model);
  if (alpaResult) return alpaResult;

  return null;
}

export async function POST(request: Request) {
  try {
    const { messages, mode, model } = (await request.json()) as {
      messages: ChatMessage[];
      mode?: string;
      model?: string;
    };

    const reply = await askAI(messages, mode ?? "umum", model);

    if (reply) {
      return Response.json({ reply, mode: "live" });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    return Response.json({
      reply:
        "⚠️ Semua model AI sedang sibuk. Coba lagi dalam beberapa detik.\n\n" +
        `Pertanyaanmu: "${lastUser}"`,
      mode: "demo",
    });
  } catch (err) {
    return Response.json(
      { error: "Terjadi kesalahan di server.", detail: String(err) },
      { status: 500 },
    );
  }
}
