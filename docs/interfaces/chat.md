# Chat Interface

The flagship interface. General purpose — chat, image, video, coding, file attachments.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Onboarding | `/onboarding` | First-time setup — keys, cascade, appearance, persona |
| Chat | `/chat/:id?` | Main conversation view |
| Projects | `/projects` | Multi-model workspaces |
| Library | `/library` | Uploaded files and generated media |
| Runtime | `/runtime` | Live provider health, cascade timeline, session stats |
| Settings | `/settings` | Keys, appearance, persona, storage, about |

## Gateway endpoints used

| Endpoint | Purpose |
|----------|---------|
| `POST /api/chat/stream` | Stream chat responses |
| `GET /api/chat/history/:id` | Load conversation history |
| `GET /api/models` | Populate model selector |
| `GET /api/providers/health` | Runtime health grid |
| `POST /api/keys` | Save key from onboarding/settings |
| `GET /api/keys` | Load saved keys on mount |
| `DELETE /api/keys/:provider` | Remove key from settings |
| `GET /api/sites/config` | Resolve UI variant from hostname |

## Cascade behavior

Cascade is shown to the user via the `cascade.event.tsx` component — a subtle inline event in the message list showing which model took over and why. The token bar shows live cost accumulation.

## Key conventions

- All files follow `{name}.{function}.{ext}` — e.g. `chat.page.tsx`, `chat.store.ts`
- Pages own their store and types
- Components are dumb — they receive props, emit events, own no state
- Hooks own side effects and data fetching
- `api.lib.ts` is the only file that calls the gateway
