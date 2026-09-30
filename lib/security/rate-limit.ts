import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/types/api";

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 60,000 = 1 minute)
  maxRequests?: number; // Max allowed requests per window (default from env or 20)
  prefix?: string; // Optional namespace prefix (e.g. "draw", "interpret")
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds when the window resets
  retryAfter: number; // Seconds to wait until retry is allowed
}

interface ClientRateRecord {
  count: number;
  resetTime: number; // Milliseconds timestamp
}

const rateLimitStore = new Map<string, ClientRateRecord>();
const MAX_STORED_IPS = 10000;

/**
 * Periodically clears expired IP records to prevent memory leaks.
 */
export function cleanupExpiredRateLimits(now: number = Date.now()): void {
  for (const [key, record] of rateLimitStore.entries()) {
    if (now >= record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Clears all rate limit records (primarily for test isolation).
 */
export function clearRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Returns current count of tracked keys in memory.
 */
export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

/**
 * Extracts client IP address from standard request headers.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp?.trim()) {
    return cfConnectingIp.trim();
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp?.trim()) {
    return xRealIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Evaluates whether a request exceeds the IP-based rate limit (SDD §3, §7).
 */
export function checkRateLimit(
  request: Request,
  options?: RateLimitOptions
): RateLimitResult {
  if (process.env.RATE_LIMIT_DISABLED === "true") {
    return {
      success: true,
      limit: 9999,
      remaining: 9999,
      reset: Math.ceil(Date.now() / 1000) + 60,
      retryAfter: 0,
    };
  }

  const now = Date.now();
  cleanupExpiredRateLimits(now);

  const windowMs = options?.windowMs ?? 60 * 1000;
  const envLimit = process.env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE, 10)
    : undefined;
  const maxRequests =
    options?.maxRequests ?? (Number.isFinite(envLimit) && envLimit! > 0 ? envLimit! : 20);

  const prefix = options?.prefix ?? "default";
  const clientIp = getClientIp(request);
  const key = `${prefix}:${clientIp}`;

  let record = rateLimitStore.get(key);

  if (!record || now >= record.resetTime) {
    // If store reached maximum capacity, evict the oldest key
    if (rateLimitStore.size >= MAX_STORED_IPS) {
      const oldestKey = rateLimitStore.keys().next().value;
      if (oldestKey) {
        rateLimitStore.delete(oldestKey);
      }
    }

    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
  } else {
    record.count += 1;
  }

  const remaining = Math.max(0, maxRequests - record.count);
  const resetSeconds = Math.ceil(record.resetTime / 1000);
  const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
  const success = record.count <= maxRequests;

  return {
    success,
    limit: maxRequests,
    remaining,
    reset: resetSeconds,
    retryAfter,
  };
}

/**
 * Generates an HTTP 429 response when rate limit is exceeded.
 */
export function createRateLimitResponse(
  result: RateLimitResult
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: "Rate limit exceeded. Please wait before making more requests.",
      code: "RATE_LIMIT_EXCEEDED",
      details: {
        limit: result.limit,
        retryAfterSeconds: result.retryAfter,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(result.reset),
      },
    }
  );
}

/**
 * Appends standard rate limit headers to a successful response.
 */
export function applyRateLimitHeaders<T>(
  response: NextResponse<T>,
  result: RateLimitResult
): NextResponse<T> {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.reset));
  return response;
}
