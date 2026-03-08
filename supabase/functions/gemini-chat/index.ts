import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getApiKeys(): string[] {
  const raw = Deno.env.get("GEMINI_API_KEYS") || "";
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, systemPrompt, model, fileData, stream } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: "No API keys configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const modelId = model || "gemini-2.5-flash-preview-05-20";
    const sysPrompt = systemPrompt || "You are AdiGon AI, a helpful and creative assistant.";

    // Build request body
    const contents: any[] = [];
    const parts: any[] = [{ text: prompt }];

    if (fileData?.base64 && fileData?.mimeType) {
      parts.push({
        inlineData: { data: fileData.base64, mimeType: fileData.mimeType },
      });
    }

    contents.push({ role: "user", parts });

    const requestBody: any = {
      system_instruction: { parts: [{ text: sysPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 16384,
      },
    };

    // Try each key until one works
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      const endpoint = stream
        ? `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Key ${i + 1} failed (${response.status}):`, errText);
          continue; // try next key
        }

        if (stream && response.body) {
          // Return SSE stream directly
          return new Response(response.body, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        }

        // Non-streaming: parse and return text
        const data = await response.json();
        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return new Response(JSON.stringify({ text }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.warn(`Key ${i + 1} error:`, err);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ error: "All API keys exhausted. Please try again later." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("gemini-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
