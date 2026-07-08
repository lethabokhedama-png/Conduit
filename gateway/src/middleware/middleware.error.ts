import type { MiddlewareHandler, ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

// ── Typed error response ───────────────────────────────────────────────────────

export interface ErrorResponse {
   error: string;
   code: string;
   /** Human-readable detail — included in non-production environments */
   detail?: string;
   requestId?: string;
}

// ── Request ID ────────────────────────────────────────────────────────────────

/**
 * Generates a compact request ID for tracing. Format: `req_<8 hex chars>`.
 * Not cryptographically secure — only used for log correlation.
 */
function generateRequestId(): string {
   const bytes = crypto.getRandomValues(new Uint8Array(4));
   return `req_${Array.from(bytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")}`;
}

// ── Request ID middleware ──────────────────────────────────────────────────────

/**
 * Attaches a request ID to every request and response. Used to correlate
 * gateway logs with client-reported errors. Reads the X-Request-ID header
 * if provided by a reverse proxy, otherwise generates a fresh one.
 */
export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
   const requestId =
      c.req.header("X-Request-ID")?.slice(0, 64) ?? generateRequestId();
   c.set("requestId", requestId);
   c.header("X-Request-ID", requestId);
   await next();
};

// ── Global error handler ──────────────────────────────────────────────────────

/**
 * Central error handler for Hono. Converts every thrown error into a
 * consistent JSON response shape. Three categories:
 *
 * 1. `HTTPException` — thrown explicitly by route handlers (404, 422, etc.)
 * 2. `ZodError` — body validation failures surfaced as 422 Unprocessable Entity
 * 3. Everything else — treated as an unhandled 500; detail hidden in production
 *
 * SSE routes must never throw to the caller — they yield typed error events
 * instead. This handler catches anything that escapes that contract.
 */
export const errorHandler: ErrorHandler = (err, c) => {
   const isDev = process.env.NODE_ENV !== "production";
   const requestId = c.get("requestId") as string | undefined;

   // ── Hono HTTP exceptions ───────────────────────────────────────────────────
   if (err instanceof HTTPException) {
      const body: ErrorResponse = {
         error: err.message,
         code: `http_${err.status}`,
         ...(requestId ? { requestId } : {})
      };
      return c.json(body, err.status);
   }

   // ── Zod validation errors ──────────────────────────────────────────────────
   if (err instanceof ZodError) {
      const issues = err.issues
         .map(i => `[${i.path.join(".")}] ${i.message}`)
         .join("; ");

      const body: ErrorResponse = {
         error: "Request validation failed",
         code: "validation_error",
         ...(isDev ? { detail: issues } : {}),
         ...(requestId ? { requestId } : {})
      };
      return c.json(body, 422);
   }

   // ── Unhandled errors ───────────────────────────────────────────────────────
   const message = err instanceof Error ? err.message : String(err);

   console.error(
      `[gateway:error] Unhandled error${requestId ? ` [${requestId}]` : ""}:`,
      err
   );

   const body: ErrorResponse = {
      error: "Internal server error",
      code: "internal_error",
      ...(isDev ? { detail: message } : {}),
      ...(requestId ? { requestId } : {})
   };
   return c.json(body, 500);
};

// ── 404 handler ───────────────────────────────────────────────────────────────

/**
 * Hono calls this when no route matched. Returns a clean JSON 404 rather
 * than Hono's default text/plain "404 Not Found".
 */
export const notFoundHandler = (c: Parameters<ErrorHandler>[1]) => {
   const body: ErrorResponse = {
      error: `Route not found: ${c.req.method} ${c.req.path}`,
      code: "not_found"
   };
   return c.json(body, 404);
};
