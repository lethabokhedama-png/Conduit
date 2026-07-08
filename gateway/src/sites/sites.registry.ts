import type { SiteProfile } from "@config/config.schema";

// ── Default profile ───────────────────────────────────────────────────────────

/**
 * Returned for any host that isn't explicitly mapped in conduit.config.toml.
 * Using 'default' as the variant signals the frontend to render the root
 * onboarding / home experience rather than a specific interface mode.
 */
export const DEFAULT_SITE_PROFILE: SiteProfile = {
   variant: "default"
};

// ── Valid variants ─────────────────────────────────────────────────────────────

export const VALID_VARIANTS = ["chat", "media", "tester", "default"] as const;
export type SiteVariant = (typeof VALID_VARIANTS)[number];

/**
 * Returns true if a string is a valid site variant identifier.
 * Used to guard against typos in conduit.config.toml at load time.
 */
export function isValidVariant(variant: string): variant is SiteVariant {
   return VALID_VARIANTS.includes(variant as SiteVariant);
}
