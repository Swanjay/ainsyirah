// Backend A'insyirah — menghubungkan chat ke API AI.
// Provider 1: Pollinations (free, tanpa key, anonymous tier)
// Provider 2: Alpakyros (backup, butuh API key)
// Model verified: openai-fast (GPT-OSS 20B) via Pollinations

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

import { readFileSync } from "fs";
import { join } from "path";

// API key Alpakyros: prioritas ENV variable (Vercel), fallback ke file .key.b64 (lokal)
let _alpakyrosKey = process.env.ALPAYKROS_KEY ?? "";
if (!_alpakyrosKey) {
  try {
    const _keyPath = join(process.cwd(), ".key.b64");
    _alpakyrosKey = Buffer.from(readFileSync(_keyPath, "utf-8").trim(), "base64").toString();
  } catch {}
}

// Daftar "kepribadian" asisten
const PERSONAS: Record<string, string> = {
  umum:
    "Kamu adalah A'insyirah, asisten AI ramah berbahasa Indonesia (seperti ChatGPT). " +
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

// Map model frontend → model Pollinations
function toPollinationsModel(modelKey: string): string {
  const map: Record<string, string> = {
    "kr/deepseek-3.2": "openai",
    "kr/claude-sonnet-4.5": "openai",
    "kr/claude-haiku-4.5": "openai",
    "kr/claude-sonnet-4": "openai",
    "kr/minimax-m2.5": "openai",
    "kr/glm-5": "openai",
  };
  return map[modelKey] ?? "openai";
}

// Map model frontend → model Alpakyros
function toAlpakyrosModel(modelKey: string): string {
  // Alpakyros menggunakan nama asli
  return modelKey;
}

// === PROVIDER 1: Pollinations (primary, free, tanpa key) ===
// Endpoint: https://text.pollinations.ai/ (non-legacy, JSON response)
async function askPollinations(
  messages: ChatMessage[],
  systemPrompt: ChatMessage,
  modelKey: string,
): Promise<string | null> {
  const pollModel = toPollinationsModel(modelKey);
  try {
    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: pollModel,
        messages: [systemPrompt, ...messages],
      }),
    });
    if (res.ok) {
      const text = await res.text();
      // Pollinations returns plain text or JSON
      try {
        const data = JSON.parse(text);
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          console.log(`OK via Pollinations/${pollModel} (JSON)`);
          return reply;
        }
      } catch {
        // Plain text response
        if (text && !text.includes('"error"')) {
          console.log(`OK via Pollinations/${pollModel} (text)`);
          return text.trim();
        }
      }
    } else {
      const errText = await res.text().catch(() => "");
      console.error(`Pollinations error: ${res.status} ${errText.slice(0, 100)}`);
    }
  } catch (err) {
    console.error(`Pollinations failed:`, err);
  }
  return null;
}

// === PROVIDER 2: Alpakyros (backup, butuh key) ===
async function askAlpakyros(
  messages: ChatMessage[],
  systemPrompt: ChatMessage,
  modelKey: string,
): Promise<string | null> {
  if (!_alpakyrosKey) return null;
  const model = toAlpakyrosModel(modelKey);
  try {
    const res = await fetch("https://api.alpakyros.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_alpakyrosKey}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [systemPrompt, ...messages],
        stream: false,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) {
        console.log(`OK via Alpakyros/${model}`);
        return reply;
      }
    } else {
      const errText = await res.text().catch(() => "");
      console.error(`Alpakyros error: ${res.status} ${errText.slice(0, 100)}`);
    }
  } catch (err) {
    console.error(`Alpakyros failed:`, err);
  }
  return null;
}

// Main: coba Pollinations dulu, lalu Alpakyros
async function askAI(messages: ChatMessage[], persona: string, chosenModel?: string): Promise<string | null> {
  const systemPrompt: ChatMessage = {
    role: "system",
    content: PERSONAS[persona] ?? PERSONAS.umum,
  };

  const model = chosenModel ?? "kr/deepseek-3.2";

  // 1) Pollinations (primary — free, no key, works from Vercel)
  const pollResult = await askPollinations(messages, systemPrompt, model);
  if (pollResult) return pollResult;

  // 2) Alpakyros (backup — needs key)
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
