/**
 * KKU IntelliShare API Provider Adapter (Primary Provider - SDD §7, §7.1).
 * Uses OpenAI-compatible chat completions interface.
 */
export async function callKKUIntelliShare(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number = 15000
): Promise<string> {
  const apiKey = process.env.KKU_INTELLISHARE_API_KEY;
  if (!apiKey) {
    throw new Error("KKU_INTELLISHARE_API_KEY is not configured.");
  }

  const rawBaseUrl = process.env.KKU_INTELLISHARE_BASE_URL || "https://intellishare.kku.ac.th/v1";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const model = process.env.KKU_INTELLISHARE_MODEL || "gpt-4o-mini";

  const endpoint = `${baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    // If gateway rejects response_format, retry once without it
    if (!response.ok && response.status === 400) {
      const errClone = response.clone();
      const errText = await errClone.text().catch(() => "");
      if (errText.includes("response_format") || errText.includes("json_object")) {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1500,
          }),
          signal: controller.signal,
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`KKU IntelliShare responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("KKU IntelliShare returned an empty response.");
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}
