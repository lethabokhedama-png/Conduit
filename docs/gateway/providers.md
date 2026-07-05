# Providers

Conduit supports three provider categories. Each has its own adapter interface, registry, and route group.

## Categories

### Chat
Streaming text generation. Powers `interfaces/chat`.

| Provider | ID | Models |
|----------|----|--------|
| Anthropic | `anthropic` | claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5 |
| OpenAI | `openai` | gpt-4o, gpt-4o-mini, gpt-4-turbo |
| Google | `google` | gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash |
| Groq | `groq` | llama3-70b, llama3-8b, mixtral-8x7b |
| Ollama | `ollama` | any locally running model |

### Image
Image generation. Powers `interfaces/media`.

| Provider | ID | Models |
|----------|----|--------|
| OpenAI Images | `openai-images` | dall-e-3, dall-e-2 |
| Stability AI | `stability` | stable-diffusion-3, sdxl |

### Search
Web search and OSINT. Powers `interfaces/tester` and `interfaces/chat` search mode.

| Provider | ID |
|----------|----|
| SerpAPI | `serpapi` |
| Brave Search | `brave` |

## Adding a provider

1. Create the adapter file in `gateway/src/providers/{category}/`
2. Implement the category's adapter interface (`chat.types.ts`, `media.types.ts`, or `search.types.ts`)
3. Register it in the category's `registry.ts`
4. Add the provider's env key to `.env.example` and `config.env.ts`
5. Add a probe to `discovery.probe.ts` so the tester interface can detect it

## Key resolution order

1. Temporary override (during introspection/probing)
2. Database (saved via UI)
3. Environment variable (`PROVIDER_API_KEY`)
