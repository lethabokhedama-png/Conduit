import { Hono } from "hono";
import { handleDiscoveryProbe } from "./discovery.probe";

/**
 * Discovery routes — used by the tester interface.
 *
 * POST /api/discovery/probe → probe a raw key against all providers
 */
const discoveryRoute = new Hono();

discoveryRoute.post("/probe", handleDiscoveryProbe);

export { discoveryRoute };
