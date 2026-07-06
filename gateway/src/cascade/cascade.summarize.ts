import { getChatAdapterForModel } from "@providers/chat/chat.registry";
import type { ChatMessage } from "@providers/provider.types";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Maximum character length of the raw transcript sent to the compressor.
 * Caps the cost of a single summarization call — even a 200k-token Anthropic
 * conversation is summarized from this slice rather than the full history.
 */
const MAX_TRANSCRIPT_CHARS = 12_000;

/**
 * Target length of the generated summary in tokens. Kept intentionally short
 * so the summary itself doesn't consume a meaningful fraction of the next
 * model's context window.
 */
const MAX_SUMMARY_TOKENS = 500;

const SYSTEM_PROMPT = `You are a conversation relay assistant. Your only job is to produce a dense, accurate context handoff note for another AI model that is about to continue this conversation.

Rules:
- Write in third person ("The user asked...", "The assistant explained...")
- Preserve every specific fact, number, decision, file name, code snippet, or user preference mentioned
- Include the user's most recent request verbatim at the end, labeled "CURRENT REQUEST:"
- Maximum ${MAX_SUMMARY_TOKENS} tokens
- Do not add commentary, do not summarize your own summary
- Output plain text only — no markdown, no headers`;

// ── Summarizer ────────────────────────────────────────────────────────────────

/**
 * Summarizes a conversation for handoff to the next model in the cascade chain.
 *
 * Uses the profile's designated compressor model — typically a fast, cheap
 * model like Groq Llama 3.1 8B. If the compressor is unavailable (not
 * configured, times out, errors), falls back to `naiveTruncate()` which
 * preserves the most recent messages verbatim. The cascade engine's handoff
 * must never block on a failed summarization.
 *
 * @param messages    Full message history up to the point of handoff
 * @param compressor  Model ID to use for summarization (from cascade profile)
 * @returns           A ChatMessage array suitable for passing directly to the
 *                    next model's stream() call
 */
export async function summarizeForHandoff(
   messages: ChatMessage[],
   compressor?: string
): Promise<ChatMessage[]> {
   if (!compressor) {
      return naiveTruncate(messages);
   }

   const adapter = getChatAdapterForModel(compressor);
   if (!adapter || !adapter.isConfigured()) {
      console.warn(
         `[cascade:summarize] compressor "${compressor}" is not configured — falling back to naive truncation`
      );
      return naiveTruncate(messages);
   }

   const transcript = buildTranscript(messages);

   let summary = "";
   try {
      // Use a hard timeout — if the compressor hangs, we fall back immediately
      const compressorMessages: ChatMessage[] = [
         { role: "user", content: transcript }
      ];

      const timeoutMs = 15_000;
      const raceTimeout = new Promise<never>((_, reject) =>
         setTimeout(() => reject(new Error("summarize timeout")), timeoutMs)
      );

      const streamGen = (adapter as any).stream(
         compressorMessages,
         compressor,
         {
            maxTokens: MAX_SUMMARY_TOKENS,
            systemPrompt: SYSTEM_PROMPT,
            temperature: 0.1 // low temperature for factual, consistent summaries
         }
      ) as AsyncGenerator<import("@providers/provider.types").StreamEvent>;

      const collect = async (): Promise<string> => {
         let text = "";
         for await (const event of streamGen) {
            if (event.type === "token") text += event.content;
            if (event.type === "error") throw new Error(event.error);
         }
         return text;
      };

      summary = await Promise.race([collect(), raceTimeout]);

      if (!summary.trim()) {
         throw new Error("empty summary returned");
      }
   } catch (err) {
      console.warn(
         `[cascade:summarize] summarization failed (${err instanceof Error ? err.message : err}) — falling back to naive truncation`
      );
      return naiveTruncate(messages);
   }

   // Inject the summary as a system message, keeping the user's last message
   // verbatim so the new model has the exact request to respond to.
   const lastUserMessage = [...messages].reverse().find(m => m.role === "user");

   return [
      {
         role: "system",
         content: `[CONTEXT HANDOFF — conversation continued from a previous model]\n\n${summary}`
      },
      ...(lastUserMessage ? [lastUserMessage] : [])
   ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildTranscript(messages: ChatMessage[]): string {
   const lines = messages
      .filter(m => m.role !== "system")
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

   // Truncate from the beginning if too long — always preserve the most recent
   // messages since they're most relevant to the handoff
   if (lines.length > MAX_TRANSCRIPT_CHARS) {
      return (
         "[earlier messages truncated]\n\n" + lines.slice(-MAX_TRANSCRIPT_CHARS)
      );
   }

   return lines;
}

/**
 * Naive fallback when no compressor is available. Keeps the system prompt
 * (if any) and the most recent messages that fit within a 6k character budget.
 * Always preserves the user's most recent message.
 */
function naiveTruncate(messages: ChatMessage[]): ChatMessage[] {
   const CHAR_BUDGET = 6_000;

   const systemMessages = messages.filter(m => m.role === "system");
   const nonSystem = messages.filter(m => m.role !== "system");

   const kept: ChatMessage[] = [];
   let chars = 0;

   // Walk backwards through non-system messages, keeping as many as fit
   for (let i = nonSystem.length - 1; i >= 0; i--) {
      const msg = nonSystem[i]!;
      chars += msg.content.length;
      if (chars > CHAR_BUDGET && kept.length > 0) break;
      kept.unshift(msg);
   }

   const truncated = kept.length < nonSystem.length;
   const prefix: ChatMessage[] = truncated
      ? [
           {
              role: "system",
              content:
                 "[Note: earlier messages were truncated for context handoff]"
           }
        ]
      : [];

   return [...systemMessages, ...prefix, ...kept];
}
