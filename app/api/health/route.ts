export const runtime = "nodejs";

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY ?? "";
  
  let groqStatus = "no_key";
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + groqKey,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 10,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        groqStatus = "ok: " + (data?.choices?.[0]?.message?.content ?? "?");
      } else {
        groqStatus = "error " + res.status + ": " + (await res.text().catch(() => "")).slice(0, 100);
      }
    } catch (err) {
      groqStatus = "failed: " + String(err);
    }
  }

  return Response.json({
    groq_key_set: !!groqKey,
    groq_key_prefix: groqKey.slice(0, 8),
    groq_test: groqStatus,
    timestamp: new Date().toISOString(),
  });
}
