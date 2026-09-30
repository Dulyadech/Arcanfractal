import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  getClientIp,
  clearRateLimits,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/security/rate-limit";
import { POST as drawHandler } from "@/app/api/draw/route";
import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/types/api";

describe("IP-based Rate Limiter (SDD §3, §7)", () => {
  beforeEach(() => {
    clearRateLimits();
  });

  describe("IP Extraction", () => {
    it("extracts client IP from x-forwarded-for header", () => {
      const req = new Request("http://localhost:3000/api/draw", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("extracts client IP from cf-connecting-ip header", () => {
      const req = new Request("http://localhost:3000/api/draw", {
        headers: { "cf-connecting-ip": "198.51.100.42" },
      });
      expect(getClientIp(req)).toBe("198.51.100.42");
    });

    it("extracts client IP from x-real-ip header", () => {
      const req = new Request("http://localhost:3000/api/draw", {
        headers: { "x-real-ip": "192.0.2.1" },
      });
      expect(getClientIp(req)).toBe("192.0.2.1");
    });

    it("falls back to 127.0.0.1 when no IP headers exist", () => {
      const req = new Request("http://localhost:3000/api/draw");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("Rate Limit Enforcement", () => {
    it("allows requests within the limit and decrements remaining quota", () => {
      const req = new Request("http://localhost:3000/api/draw", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      });

      const res1 = checkRateLimit(req, { maxRequests: 3, windowMs: 60000 });
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = checkRateLimit(req, { maxRequests: 3, windowMs: 60000 });
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = checkRateLimit(req, { maxRequests: 3, windowMs: 60000 });
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);

      // 4th request exceeds limit
      const res4 = checkRateLimit(req, { maxRequests: 3, windowMs: 60000 });
      expect(res4.success).toBe(false);
      expect(res4.remaining).toBe(0);
      expect(res4.retryAfter).toBeGreaterThan(0);
    });

    it("isolates rate limits between different client IPs", () => {
      const reqA = new Request("http://localhost:3000/api/draw", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      });
      const reqB = new Request("http://localhost:3000/api/draw", {
        headers: { "x-forwarded-for": "10.0.0.2" },
      });

      // Exhaust IP A
      checkRateLimit(reqA, { maxRequests: 1, windowMs: 60000 });
      const blockedA = checkRateLimit(reqA, { maxRequests: 1, windowMs: 60000 });
      expect(blockedA.success).toBe(false);

      // IP B should still be allowed
      const allowedB = checkRateLimit(reqB, { maxRequests: 1, windowMs: 60000 });
      expect(allowedB.success).toBe(true);
      expect(allowedB.remaining).toBe(0);
    });

    it("isolates limits across different prefix namespaces", () => {
      const req = new Request("http://localhost:3000/api/test", {
        headers: { "x-forwarded-for": "10.0.0.3" },
      });

      // Exhaust "draw" prefix
      checkRateLimit(req, { prefix: "draw", maxRequests: 1 });
      const blockedDraw = checkRateLimit(req, { prefix: "draw", maxRequests: 1 });
      expect(blockedDraw.success).toBe(false);

      // "interpret" prefix should still be permitted
      const allowedInterpret = checkRateLimit(req, { prefix: "interpret", maxRequests: 1 });
      expect(allowedInterpret.success).toBe(true);
    });
  });

  describe("HTTP Responses & Headers", () => {
    it("creates an HTTP 429 response with proper retry headers", async () => {
      const rateLimitResult = {
        success: false,
        limit: 20,
        remaining: 0,
        reset: Math.ceil(Date.now() / 1000) + 45,
        retryAfter: 45,
      };

      const response = createRateLimitResponse(rateLimitResult);
      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("45");
      expect(response.headers.get("X-RateLimit-Limit")).toBe("20");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");

      const body = (await response.json()) as ApiErrorResponse;
      expect(body.code).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("applies rate limit headers to successful responses", () => {
      const rateLimitResult = {
        success: true,
        limit: 20,
        remaining: 18,
        reset: 1720000000,
        retryAfter: 0,
      };

      const initial = NextResponse.json({ ok: true });
      const withHeaders = applyRateLimitHeaders(initial, rateLimitResult);

      expect(withHeaders.headers.get("X-RateLimit-Limit")).toBe("20");
      expect(withHeaders.headers.get("X-RateLimit-Remaining")).toBe("18");
      expect(withHeaders.headers.get("X-RateLimit-Reset")).toBe("1720000000");
    });
  });

  describe("Route Integration", () => {
    it("returns 429 from POST /api/draw when client exceeds rate limit", async () => {
      const clientIp = "192.168.1.100";

      // Configure a small limit via env
      process.env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE = "2";

      const makeRequest = () =>
        new Request("http://localhost:3000/api/draw", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": clientIp,
          },
          body: JSON.stringify({ spreadId: "single" }),
        });

      // 1st request -> 200
      const res1 = await drawHandler(makeRequest());
      expect(res1.status).toBe(200);

      // 2nd request -> 200
      const res2 = await drawHandler(makeRequest());
      expect(res2.status).toBe(200);

      // 3rd request -> 429 Too Many Requests
      const res3 = await drawHandler(makeRequest());
      expect(res3.status).toBe(429);

      const err = (await res3.json()) as ApiErrorResponse;
      expect(err.code).toBe("RATE_LIMIT_EXCEEDED");

      delete process.env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE;
    });
  });
});
