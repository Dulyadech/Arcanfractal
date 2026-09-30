/**
 * Google Gemini API Provider Adapter (Backup Provider - SDD §7, §7.1).
 * Uses Gemini REST API generateContent with JSON response MIME type.
 */
export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number = 15000
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const configuredModel = process.env.GEMINI_MODEL;
  const model = configuredModel && configuredModel !== "gemini-2.0-flash" ? configuredModel : "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: combinedPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Gemini responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text || typeof text !== "string") {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}
