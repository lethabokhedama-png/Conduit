# Media Interface

Dedicated workspace for media creation and coding. Deeper than the chat interface — a full canvas, layer management, code editor with execution.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Generate | `/generate` | Prompt-to-image/video/audio generation |
| Canvas | `/canvas` | Visual workspace — arrange, edit, layer generated media |
| Code | `/code` | Code editor with AI completion and sandbox execution |
| Settings | `/settings` | Provider keys scoped to media/code providers |

## Gateway endpoints used

| Endpoint | Purpose |
|----------|---------|
| `POST /api/media/generate` | Generate image/video/audio from prompt |
| `GET /api/media/providers` | List available image providers and models |
| `POST /api/code/execute` | Run code in E2B sandbox |
| `POST /api/chat/stream` | AI code completion (uses chat stream) |
| `GET /api/keys` | Load saved keys |

## Canvas

Built on `fabric.js`. Generated images land directly on the canvas as moveable, resizable layers. Export uses the File System Access API — writes directly to a user-chosen folder on their machine, no download prompt.

## Code editor

Built on Monaco Editor (VS Code's editor). Language detection is automatic. Execution routes to E2B sandbox via `/api/code/execute`.
