// Backend A'insyirah — menghubungkan chat ke API AI.
// Provider 1: Groq (primary, fast, free tier)
// Provider 2: OpenRouter (secondary, 27+ free models)
// Provider 3: Pollinations (backup, free, no key)
// Provider 4: Dahono Labs (20 free models, via relay)

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

// API keys: cukup ENV variable (Vercel)
const _groqKey = process.env.GROQ_API_KEY ?? "";
const _openrouterKey = process.env.OPENROUTER_API_KEY ?? "";
const isVercel = !!process.env.VERCEL;

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

// Valid model keys (backend validation)
const VALID_MODELS = new Set([
  "groq/llama-3.1-8b", "groq/llama-3.3-70b", "groq/qwen3-32b",
  "groq/gpt-oss-120b", "groq/llama-4-scout", "groq/gpt-oss-20b",
  "or/hermes-405b", "or/qwen3-coder", "or/kimi-k2.6",
  "or/nemotron-ultra", "or/gemma-4-31b", "or/llama-3.3-70b",
  "dh/qwen-max", "dh/qwen3.5-omni-flash", "dh/qwen-plus",
  "dh/qwen3-coder-flash", "dh/qwen3.7-max", "dh/glm-5.1",
  "dh/deepseek-v4-flash", "dh/deepseek-v4-pro", "dh/qwen3-coder-plus",
  "dh/qwen-flash",
]);

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

// Map model frontend → OpenRouter model name
function toOpenRouterModel(modelKey: string): string {
  const map: Record<string, string> = {
    "or/hermes-405b": "nousresearch/hermes-3-llama-3.1-405b:free",
    "or/qwen3-coder": "qwen/qwen3-coder:free",
    "or/kimi-k2.6": "moonshotai/kimi-k2.6:free",
    "or/nemotron-ultra": "nvidia/nemotron-3-ultra-550b-a55b:free",
    "or/gemma-4-31b": "google/gemma-4-31b-it:free",
    "or/llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct:free",
  };
  return map[modelKey] ?? "nousresearch/hermes-3-llama-3.1-405b:free";
}

// Check if model is OpenRouter
function isOpenRouterModel(modelKey: string): boolean {
  return modelKey.startsWith("or/");
}

// Check if model is Dahono Labs
function isDahonoModel(modelKey: string): boolean {
  return modelKey.startsWith("dh/");
}

// Map model frontend → Dahono Labs model name
function toDahonoModel(modelKey: string): string {
  const map: Record<string, string> = {
    "dh/qwen-max": "dahono/qwen-max",
    "dh/qwen3.5-omni-flash": "dahono/qwen3.5-omni-flash",
    "dh/qwen-plus": "dahono/qwen-plus",
    "dh/qwen3-coder-flash": "dahono/qwen3-coder-flash",
    "dh/qwen3.7-max": "dahono/qwen3.7-max",
    "dh/glm-5.1": "dahono/glm-5.1",
    "dh/deepseek-v4-flash": "dahono/deepseek-v4-flash",
    "dh/deepseek-v4-pro": "dahono/deepseek-v4-pro",
    "dh/qwen3-coder-plus": "dahono/qwen3-coder-plus",
    "dh/qwen-flash": "dahono/qwen-flash",
  };
  return map[modelKey] ?? "dahono/qwen-max";
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

// === PROVIDER 2: OpenRouter (free models) ===
async function askOpenRouter(
  messages: ChatMessage[],
  systemPrompt: ChatMessage,
  modelKey: string,
): Promise<string | null> {
  if (!_openrouterKey) return null;
  const model = toOpenRouterModel(modelKey);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_openrouterKey}`,
        "HTTP-Referer": "https://ainsyirah.vercel.app",
        "X-Title": "A'insyirah AI",
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
        console.log(`OK via OpenRouter/${model}`);
        return reply;
      }
    } else {
      const errText = await res.text().catch(() => "");
      console.error(`OpenRouter error: ${res.status} ${errText.slice(0, 150)}`);
    }
  } catch (err) {
    console.error(`OpenRouter failed:`, err);
  }
  return null;
}

// === PROVIDER 3: Pollinations (backup, free, no key) ===
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

// === PROVIDER 4: Dahono Labs (free, via relay — LOCAL ONLY) ===
async function askDahono(
  messages: ChatMessage[],
  systemPrompt: ChatMessage,
  modelKey: string,
): Promise<string | null> {
  // Dahono relay cuma jalan di local, skip di Vercel production
  if (isVercel) return null;

  const model = toDahonoModel(modelKey);
  try {
    const res = await fetch("http://127.0.0.1:18082/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        console.log(`OK via Dahono/${model}`);
        return reply;
      }
    } else {
      const errText = await res.text().catch(() => "");
      console.error(`Dahono error: ${res.status} ${errText.slice(0, 150)}`);
    }
  } catch (err) {
    console.error(`Dahono failed:`, err);
  }
  return null;
}

// Main: Groq → OpenRouter (if or/ model) → Dahono → Pollinations
async function askAI(messages: ChatMessage[], persona: string, chosenModel?: string): Promise<string | null> {
  const systemPrompt: ChatMessage = {
    role: "system",
    content: PERSONAS[persona] ?? PERSONAS.umum,
  };
  const model = chosenModel ?? "groq/llama-3.1-8b";

  // If user chose an OpenRouter model, try that first
  if (isOpenRouterModel(model)) {
    const orResult = await askOpenRouter(messages, systemPrompt, model);
    if (orResult) return orResult;
    // fallback to Groq
    const groqResult = await askGroq(messages, systemPrompt, "groq/llama-3.1-8b");
    if (groqResult) return groqResult;
  } else if (isDahonoModel(model)) {
    // If user chose a Dahono model, try that first
    const dahonoResult = await askDahono(messages, systemPrompt, model);
    if (dahonoResult) return dahonoResult;
    // fallback to Groq
    const groqResult = await askGroq(messages, systemPrompt, "groq/llama-3.1-8b");
    if (groqResult) return groqResult;
  } else {
    // 1) Groq (primary — fast, reliable)
    const groqResult = await askGroq(messages, systemPrompt, model);
    if (groqResult) return groqResult;

    // 2) OpenRouter (fallback)
    const orResult = await askOpenRouter(messages, systemPrompt, "or/hermes-405b");
    if (orResult) return orResult;
  }

  // 3) Dahono Labs (free, via relay — local only)
  const dahonoResult = await askDahono(messages, systemPrompt, "dh/qwen-max");
  if (dahonoResult) return dahonoResult;

  // 4) Pollinations (backup — free, no key)
  const pollResult = await askPollinations(messages, systemPrompt);
  if (pollResult) return pollResult;

  return null;
}

export async function POST(request: Request) {
  try {
    const { messages, mode, model } = (await request.json()) as {
      messages: ChatMessage[];
      mode?: string;
      model?: string;
    };

    // Validate model key
    const safeModel = model && VALID_MODELS.has(model) ? model : undefined;

    const reply = await askAI(messages, mode ?? "umum", safeModel);

    if (reply) {
      return Response.json({ reply, mode: "live" });
    }

    return Response.json({
      reply:
        "⚠️ Semua model AI sedang sibuk. Coba lagi dalam beberapa detik.",
      mode: "demo",
    });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan di server." },
      { status: 500 },
    );
  }
}
