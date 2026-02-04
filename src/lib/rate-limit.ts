import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter
 * For production, consider Redis or Vercel KV
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimits = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_FREE = 10; // Free tier
const MAX_REQUESTS_PAID = 100; // Paid tier

/**
 * Check rate limit for a request
 * Returns null if allowed, NextResponse with 429 if rate limited
 */
export function rateLimit(
  request: NextRequest,
  limit: number = MAX_REQUESTS_FREE
): NextResponse | null {
  // Get identifier (IP or API key)
  const apiKey = request.headers.get("x-api-key");
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown";
  
  const identifier = apiKey || ip;
  const now = Date.now();
  
  // Get or create entry
  const entry = rateLimits.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    // New window
    rateLimits.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return null;
  }
  
  // Increment count
  entry.count++;
  
  // Check limit
  if (entry.count > limit) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000);
    
    return NextResponse.json(
      { 
        error: "Rate limit exceeded",
        message: `Too many requests. Please try again in ${resetIn} seconds.`,
        retryAfter: resetIn,
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": entry.resetAt.toString(),
          "Retry-After": resetIn.toString(),
        },
      }
    );
  }
  
  return null;
}

/**
 * Get rate limit info for a request
 */
export function getRateLimitInfo(
  request: NextRequest,
  limit: number = MAX_REQUESTS_FREE
): {
  remaining: number;
  resetAt: number;
  resetIn: number;
} {
  const apiKey = request.headers.get("x-api-key");
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown";
  
  const identifier = apiKey || ip;
  const now = Date.now();
  
  const entry = rateLimits.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    return {
      remaining: limit,
      resetAt: now + WINDOW_MS,
      resetIn: Math.ceil(WINDOW_MS / 1000),
    };
  }
  
  return {
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
    resetIn: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Cleanup expired entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetAt) {
      rateLimits.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof window === "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
