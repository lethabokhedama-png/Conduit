/**
 * Parses a Server-Sent Events (SSE) stream from a fetch Response body.
 * Yields each parsed data payload as a string, skipping keep-alive pings,
 * comments, and malformed lines.
 *
 * Designed to be used with `for await` in provider stream implementations:
 *
 * ```ts
 * for await (const data of parseSSE(response)) {
 *   if (data === '[DONE]') break
 *   const chunk = JSON.parse(data)
 *   // ...
 * }
 * ```
 */
export async function* parseSSE(response: Response): AsyncGenerator<string> {
   if (!response.body) {
      throw new Error("Response body is null — cannot parse SSE stream");
   }

   const reader = response.body.getReader();
   const decoder = new TextDecoder("utf-8");
   let buffer = "";

   try {
      while (true) {
         const { done, value } = await reader.read();

         if (done) {
            // Flush any remaining buffered data
            if (buffer.trim()) {
               const data = extractData(buffer);
               if (data !== null) yield data;
            }
            break;
         }

         buffer += decoder.decode(value, { stream: true });

         // SSE events are separated by double newlines
         const parts = buffer.split(/\n\n/);

         // The last part may be incomplete — keep it in the buffer
         buffer = parts.pop() ?? "";

         for (const part of parts) {
            const data = extractData(part);
            if (data !== null) yield data;
         }
      }
   } finally {
      reader.releaseLock();
   }
}

function extractData(block: string): string | null {
   for (const line of block.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data:")) {
         const payload = trimmed.slice(5).trim();
         // Skip keep-alive pings and empty data lines
         if (payload.length > 0 && payload !== ":") return payload;
      }
   }
   return null;
}

/**
 * Reads a non-SSE JSON error response body safely, capping at 4KB to
 * prevent memory exhaustion from unexpectedly large error bodies.
 */
export async function readErrorBody(response: Response): Promise<string> {
   try {
      const text = await response.text();
      return text.slice(0, 4_096);
   } catch {
      return `HTTP ${response.status}`;
   }
}
