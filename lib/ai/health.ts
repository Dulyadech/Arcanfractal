import type { AIProviderHealthInfo } from "@/types/api";

/**
 * Checks connectivity and configuration status for the Primary AI Provider (KKU IntelliShare).
 */
export async function checkKKUHealth(
  timeoutMs: number = 3000,
  skipNetwork: boolean = false
): Promise<AIProviderHealthInfo> {
  const apiKey = process.env.KKU_INTELLISHARE_API_KEY;
  const rawBaseUrl = process.env.KKU_INTELLISHARE_BASE_URL || "https://gen.ai.kku.ac.th/api/v1";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const configuredModel = process.env.KKU_INTELLISHARE_MODEL;
  const model =
    configuredModel && configuredModel !== "gpt-4o-mini"
      ? configuredModel
      : "gemini-3.8-flash";

  if (!apiKey) {
    return {
      name: "KKU IntelliShare",
      status: "unconfigured",
      isPrimary: true,
      model,
      message: "API key is not configured.",
    };
  }

  if (skipNetwork) {
    return {
      name: "KKU IntelliShare",
      status: "healthy",
      isPrimary: true,
      model,
      message: "Configured (network check skipped).",
    };
  }

  const endpoint = `${baseUrl}/models`;
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      return {
        name: "KKU IntelliShare",
        status: "healthy",
        isPrimary: true,
        model,
        latencyMs,
      };
    }

    return {
      name: "KKU IntelliShare",
      status: "degraded",
      isPrimary: true,
      model,
      latencyMs,
      message: `Endpoint returned HTTP status ${res.status}.`,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      name: "KKU IntelliShare",
      status: "error",
      isPrimary: true,
      model,
      latencyMs,
      message: error instanceof Error ? error.message : "Connection failed.",
    };
  }
}

/**
 * Checks connectivity and configuration status for the Backup AI Provider (Google Gemini).
 */
export async function checkGeminiHealth(
  timeoutMs: number = 3000,
  skipNetwork: boolean = false
): Promise<AIProviderHealthInfo> {
  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL;
  const model =
    configuredModel && configuredModel !== "gemini-2.0-flash"
      ? configuredModel
      : "gemini-2.5-flash";

  if (!apiKey) {
    return {
      name: "Google Gemini",
      status: "unconfigured",
      isPrimary: false,
      model,
      message: "API key is not configured.",
    };
  }

  if (skipNetwork) {
    return {
      name: "Google Gemini",
      status: "healthy",
      isPrimary: false,
      model,
      message: "Configured (network check skipped).",
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey}`;
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(endpoint, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      return {
        name: "Google Gemini",
        status: "healthy",
        isPrimary: false,
        model,
        latencyMs,
      };
    }

    return {
      name: "Google Gemini",
      status: "degraded",
      isPrimary: false,
      model,
      latencyMs,
      message: `Endpoint returned HTTP status ${res.status}.`,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      name: "Google Gemini",
      status: "error",
      isPrimary: false,
      model,
      latencyMs,
      message: error instanceof Error ? error.message : "Connection failed.",
    };
  }
}

/**
 * Aggregates health checks across all AI subsystem providers (SDD §9.3).
 */
export async function checkAIProvidersHealth(options?: {
  timeoutMs?: number;
  skipNetwork?: boolean;
}): Promise<{
  primary: AIProviderHealthInfo;
  backup: AIProviderHealthInfo;
  fallbackEngine: { status: "ok" };
}> {
  const timeoutMs = options?.timeoutMs ?? 3000;
  const skipNetwork = options?.skipNetwork ?? false;

  const [primary, backup] = await Promise.all([
    checkKKUHealth(timeoutMs, skipNetwork),
    checkGeminiHealth(timeoutMs, skipNetwork),
  ]);

  return {
    primary,
    backup,
    fallbackEngine: {
      status: "ok",
    },
  };
}
