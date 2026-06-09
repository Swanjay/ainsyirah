// Backend A'insyirah — menghubungkan chat ke API AI.
// Mendukung Alpakyros (streaming SSE) dan Pollinations (JSON biasa).
// Model free yang verified berfungsi: kr/claude-sonnet-4.5, kr/deepseek-3.2, kr/claude-haiku-4.5

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

import { readFileSync } from "fs";
import { join } from "path";

// API key: prioritas ENV variable (Vercel), fallback ke file .key.b64 (lokal)
let _apiKey = process.env.ALPAYKROS_KEY ?? "";
if (!_apiKey) {
  try {
    const _keyPath = join(process.cwd(), ".key.b64");
    _apiKey = Buffer.from(readFileSync(_keyPath, "utf-8").trim(), "base64").toString();
  } catch {}
}

const ALPAKYROS = {
  baseUrl: "https://api.alpakyros.com/v1/chat/completions",
  apiKey: _apiKey,
  models: ["kr/claude-sonnet-4.5", "kr/deepseek-3.2", "kr/claude-haiku-4.5"],
};

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

// Parse respons SSE streaming dari Alpakyros jadi teks biasa
function parseSSE(text: string): string {
  const parts: string[] = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const data = line.slice(6).trim();
    if (data === "[DONE]") break;
    try {
      const obj = JSON.parse(data);
      const delta = obj.choices?.[0]?.delta?.content;
      if (delta) parts.push(delta);
    } catch {}
  }
  return parts.join("");
}

// Daftar model free yang verified berfungsi (untuk fallback)
const FREE_MODELS = ["kr/deepseek-3.2", "kr/claude-sonnet-4.5", "kr/claude-haiku-4.5"];

// Coba panggil AI dengan fallback model
async function askAI(messages: ChatMessage[], persona: string, chosenModel?: string): Promise<string | null> {
  const systemPrompt: ChatMessage = {
    role: "system",
    content: PERSONAS[persona] ?? PERSONAS.umum,
  };

  // Susun urutan model: pilihan user dulu, lalu fallback
  const modelsToTry = chosenModel
    ? [chosenModel, ...FREE_MODELS.filter((m) => m !== chosenModel)]
    : FREE_MODELS;

  for (const model of modelsToTry) {
    try {
      const res = await fetch(ALPAKYROS.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ALPAKYROS.apiKey}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify({
          model,
          messages: [systemPrompt, ...messages],
          stream: true,
        }),
      });

      if (res.ok) {
        const raw = await res.text();
        const text = parseSSE(raw);
        if (text) {
          console.log(`A'insyirah OK via ${model}`);
          return text;
        }
      } else {
        const errText = await res.text().catch(() => "");
        console.error(`Model ${model} error:`, res.status, errText.slice(0, 100));
      }
    } catch (err) {
      console.error(`Model ${model} failed:`, err);
    }
  }

  // Semua model gagal — coba Pollinations sebagai cadangan terakhir
  try {
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai", messages: [systemPrompt, ...messages] }),
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) return reply;
    }
  } catch {}

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
        "⚠️ (Mode demo — semua model AI sedang sibuk)\n\n" +
        `Kamu bertanya: "${lastUser}"\n\n` +
        "Coba lagi sebentar ya.",
      mode: "demo",
    });
  } catch (err) {
    return Response.json(
      { error: "Terjadi kesalahan di server.", detail: String(err) },
      { status: 500 }
    );
  }
}
