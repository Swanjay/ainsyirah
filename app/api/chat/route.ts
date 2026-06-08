// A'insyirah AI Chat — terhubung ke 9router
// API key 9router disimpan langsung di kode (web pribadi, tidak dipublikasikan ke GitHub).

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

// 9router server — IP + port server kamu
const DEFAULT_BASE = "http://47.131.2.66:20128/v1";
// API key 9router — baca dari environment ATAU fallback ke hardcode
const ROUTER_KEY = process.env.ROUTER_API_KEY || "PASTI_BEDAK";

// Model irit token — tambah model baru cukup tambah 1 baris
const MODELS: Record<string, string> = {
  "mimo-flash": "mimo/mimo-v2-flash",
  "gpt": "cx/gpt-5.5", // GPT paling baru
  deepseek: "kr/deepseek-3.2",
};
const DEFAULT_MODEL = "mimo-flash";

const PERSONAS: Record<string, string> = {
  umum:
    "Kamu adalah A'insyirah, asisten AI ramah berbahasa Indonesia. " +
    "Kamu membantu menjawab pertanyaan umum, menulis, menerjemahkan, menjelaskan pelajaran, dan memberi ide. " +
    "Jawab dengan jelas, sopan, dan mudah dipahami. Gunakan bahasa sehari-hari.",
  belajar:
    "Kamu adalah A'insyirah Mode Belajar — guru privat yang sabar. " +
    "Jelaskan konsep dengan langkah sederhana, gunakan analogi, dan beri contoh.",
  nulis:
    "Kamu adalah A'insyirah Mode Menulis — asisten kreatif. " +
    "Bantu buat caption, artikel, surat, atau teks menarik dan rapi.",
  islami:
    "Kamu adalah A'insyirah Mode Islami — santun dan bernuansa religius. " +
    "Jawab dengan adab Islami, boleh sertakan dalil jika yakin.",
};

async function askAI(messages: ChatMessage[], opt: {
  baseUrl: string; apiKey: string; model: string; persona: string;
}, tries = 2): Promise<{ reply: string | null; error?: string }> {
  const sys: ChatMessage = { role: "system", content: PERSONAS[opt.persona] ?? PERSONAS.umum };
  const url = opt.baseUrl.replace(/\/$/, "") + "/chat/completions";

  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(opt.apiKey ? { Authorization: `Bearer ${opt.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: opt.model,
          messages: [sys, ...messages],
          stream: false,
          max_tokens: 1500,
        }),
      });
      const text = await res.text();
      if (res.ok) {
        try {
          const data = JSON.parse(text);
          const reply = data?.choices?.[0]?.message?.content;
          if (reply?.trim()) return { reply };
        } catch {}
      }
      if (i === tries - 1) return { reply: null, error: `HTTP ${res.status}` };
    } catch (err) {
      if (i === tries - 1) return { reply: null, error: String(err).slice(0, 200) };
    }
    if (i < tries - 1) await new Promise(r => setTimeout(r, 800));
  }
  return { reply: null, error: "No response" };
}

// GET — debug info
export async function GET() {
  let router = "unknown";
  try {
    const r = await fetch(DEFAULT_BASE + "/models", {
      headers: ROUTER_KEY ? { Authorization: `Bearer ${ROUTER_KEY}` } : {},
      signal: AbortSignal.timeout(8000),
    });
    router = `HTTP ${r.status}`;
  } catch (e) { router = String(e).slice(0, 100); }

  return Response.json({
    hasKey: !!ROUTER_KEY,
    keyLen: ROUTER_KEY.length,
    router,
    models: Object.keys(MODELS),
  });
}

// POST — chat
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages: ChatMessage[]; mode?: string; model?: string;
      customBaseUrl?: string; customApiKey?: string;
    };

    let baseUrl = DEFAULT_BASE;
    let apiKey = ROUTER_KEY;
    let model = MODELS[body.model ?? DEFAULT_MODEL] ?? MODELS[DEFAULT_MODEL];

    // Server pribadi override
    if (body.customBaseUrl?.trim()) {
      baseUrl = body.customBaseUrl.trim();
      apiKey = body.customApiKey?.trim() ?? "";
      model = (body.model ?? DEFAULT_MODEL).trim();
    }

    const result = await askAI(body.messages, {
      baseUrl, apiKey, model, persona: body.mode ?? "umum",
    });

    if (result.reply) {
      return Response.json({ reply: result.reply, mode: "live", model });
    }

    return Response.json({
      reply: "⚠️ AI tidak merespons. " + (result.error ? `(${result.error})` : "") +
        "\nCoba model lain di ⚙️ atau cek koneksi server.",
      mode: "offline",
      debug: { baseUrl, model, hasKey: !!apiKey, error: result.error },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
