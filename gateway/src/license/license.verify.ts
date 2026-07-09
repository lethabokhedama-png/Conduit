import { isOlderThan } from "@config/utils/config.version";

// ── Manifest shape ────────────────────────────────────────────────────────────

/**
 * The signed manifest fetched from LICENSE_MANIFEST_URL.
 * The license server signs this with an Ed25519 private key; the gateway
 * verifies it with the corresponding public key from LICENSE_PUBLIC_KEY.
 *
 * Shape is intentionally minimal — the only thing Conduit needs to know is
 * the minimum version it will enforce.
 */
export interface LicenseManifest {
    /** ISO 8601 timestamp of when this manifest was generated */
    issuedAt: string;
    /** Minimum semver version required to use version-locked endpoints */
    minimumVersion: string;
    /** Human-readable reason for the version requirement (shown in UI) */
    reason?: string;
}

export interface VerifyResult {
    valid: boolean;
    manifest: LicenseManifest | null;
    error?: string;
}

// ── Ed25519 verification ──────────────────────────────────────────────────────

/**
 * Parses a PEM-encoded Ed25519 public key into a CryptoKey.
 * Accepts both SPKI format (-----BEGIN PUBLIC KEY-----) and raw base64.
 */
async function importPublicKey(pemOrBase64: string): Promise<CryptoKey> {
    // Strip PEM headers and whitespace → raw base64
    const base64 = pemOrBase64
        .replace(/-----BEGIN.*?-----/g, "")
        .replace(/-----END.*?-----/g, "")
        .replace(/\s+/g, "");

    const keyBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    return crypto.subtle.importKey(
        "spki",
        keyBytes,
        { name: "Ed25519" },
        false,
        ["verify"]
    );
}

/**
 * Verifies the Ed25519 signature on a manifest payload.
 *
 * Wire format expected from the license server:
 * ```
 * <base64(signature)>.<base64(json payload)>
 * ```
 *
 * This is a compact JWT-like format without the header, keeping the manifest
 * server dead-simple (no JWT library needed on the server side).
 */
async function verifySignature(
    raw: string,
    publicKey: CryptoKey
): Promise<{ valid: boolean; payload: string }> {
    const dotIndex = raw.indexOf(".");
    if (dotIndex === -1) {
        return { valid: false, payload: "" };
    }

    const sigB64 = raw.slice(0, dotIndex);
    const payloadB64 = raw.slice(dotIndex + 1);

    let sigBytes: Uint8Array;
    let payloadBytes: Uint8Array;

    try {
        sigBytes = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
        payloadBytes = Uint8Array.from(atob(payloadB64), c => c.charCodeAt(0));
    } catch {
        return { valid: false, payload: "" };
    }

    const valid = await crypto.subtle.verify(
        "Ed25519",
        publicKey,
        sigBytes.buffer as ArrayBuffer,
        payloadBytes.buffer as ArrayBuffer
    );

    const payload = new TextDecoder().decode(payloadBytes);
    return { valid, payload };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches the signed manifest from LICENSE_MANIFEST_URL, verifies its
 * Ed25519 signature against LICENSE_PUBLIC_KEY, and returns the parsed
 * manifest if valid.
 *
 * Failure modes are all treated as `{ valid: false }` — a network outage,
 * a bad key, or a tampered manifest all result in the same outcome so
 * the gateway can decide whether to fail open or closed based on the
 * last known good state in Postgres (see license.state.ts).
 *
 * This function is intentionally stateless — it performs no Postgres reads
 * or writes. State management is `license.state.ts`'s responsibility.
 */
export async function fetchAndVerifyManifest(): Promise<VerifyResult> {
    const manifestUrl = process.env.LICENSE_MANIFEST_URL;
    const publicKeyPem = process.env.LICENSE_PUBLIC_KEY;

    if (!manifestUrl || !publicKeyPem) {
        // License system not configured — vacuously valid
        return { valid: true, manifest: null };
    }

    // ── Fetch ──────────────────────────────────────────────────────────────────
    let raw: string;
    try {
        const response = await fetch(manifestUrl, {
            signal: AbortSignal.timeout(10_000),
            headers: { "Cache-Control": "no-cache" }
        });

        if (!response.ok) {
            return {
                valid: false,
                manifest: null,
                error: `Manifest fetch failed: HTTP ${response.status}`
            };
        }

        raw = (await response.text()).trim();
    } catch (err) {
        return {
            valid: false,
            manifest: null,
            error: `Manifest fetch error: ${err instanceof Error ? err.message : String(err)}`
        };
    }

    // ── Import key ─────────────────────────────────────────────────────────────
    let publicKey: CryptoKey;
    try {
        publicKey = await importPublicKey(publicKeyPem);
    } catch (err) {
        return {
            valid: false,
            manifest: null,
            error: `Invalid public key: ${err instanceof Error ? err.message : String(err)}`
        };
    }

    // ── Verify signature ───────────────────────────────────────────────────────
    const { valid, payload } = await verifySignature(raw, publicKey);

    if (!valid) {
        return {
            valid: false,
            manifest: null,
            error: "Manifest signature verification failed"
        };
    }

    // ── Parse payload ──────────────────────────────────────────────────────────
    let manifest: LicenseManifest;
    try {
        manifest = JSON.parse(payload) as LicenseManifest;
    } catch {
        return {
            valid: false,
            manifest: null,
            error: "Manifest payload is not valid JSON"
        };
    }

    if (
        typeof manifest.minimumVersion !== "string" ||
        typeof manifest.issuedAt !== "string"
    ) {
        return {
            valid: false,
            manifest: null,
            error: "Manifest payload is missing required fields"
        };
    }

    return { valid: true, manifest };
}

/**
 * Convenience: returns true when the installed version satisfies the
 * manifest's minimum version requirement.
 */
export function manifestSatisfied(
    installedVersion: string,
    manifest: LicenseManifest
): boolean {
    // isOlderThan(a, b) = a < b
    return !isOlderThan(installedVersion, manifest.minimumVersion);
}
