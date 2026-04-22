/**
 * netlify/functions/chat.js — Netlify Serverless Function
 * Proxies requests to the Google Gemini API so the key never reaches the browser.
 * Migrated from Vercel Edge Function (api/chat.js).
 */

const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_TOKENS_CAP = 2000;

export default async (req, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  /* ── CORS pre-flight ── */
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  /* ── Only accept POST ── */
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  /* ── Parse & validate body ── */
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers,
    });
  }

  const { max_tokens, system, messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers,
    });
  }

  /* ── Retrieve the API key from environment ── */
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers }
    );
  }

  /* ── Convert message format → Gemini format ── */
  const geminiContents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const geminiBody = {
    ...(system
      ? { system_instruction: { parts: [{ text: system }] } }
      : {}),
    contents: geminiContents,
    generationConfig: {
      maxOutputTokens: Math.min(Number(max_tokens) || 1000, MAX_TOKENS_CAP),
      temperature: 0.7,
    },
  };

  /* ── Forward to Gemini ── */
  try {
    const upstream = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Gemini API error:", data);
      return new Response(
        JSON.stringify({
          error: data?.error?.message || "Gemini API error",
        }),
        { status: upstream.status, headers }
      );
    }

    /* ── Normalise response so the frontend is unchanged ── */
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't get a response right now.";

    return new Response(
      JSON.stringify({ content: [{ type: "text", text }] }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Upstream fetch error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to reach AI service" }),
      { status: 502, headers }
    );
  }
};
