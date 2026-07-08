import { Hono } from "hono";
import { handleListKeys, handleIntrospectKey } from "./keys.list";
import { handleSaveKey, handleDeleteKey } from "./keys.save";

/**
 * Key management routes. All endpoints are intentionally unauthenticated —
 * Conduit is self-hosted and assumes the gateway is only reachable by the
 * owner. There is no concept of multiple users or sessions.
 *
 * GET    /api/keys            → list all saved keys (metadata only, no raw values)
 * POST   /api/keys            → save or update a key
 * DELETE /api/keys/:provider  → remove a key
 * POST   /api/keys/introspect → probe a raw key without saving it
 */
const keysRoute = new Hono();

keysRoute.get("/", handleListKeys);
keysRoute.post("/", handleSaveKey);
keysRoute.delete("/:provider", handleDeleteKey);
keysRoute.post("/introspect", handleIntrospectKey);

export { keysRoute };
