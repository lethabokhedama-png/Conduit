import { useState, useEffect } from "react";
import { Trash2, TestTube2, Plus, ChevronRight } from "lucide-react";
import { C } from "@/lib/tokens";
import { getKeys, saveKey, deleteKey, introspectKey } from "@/lib/api.lib";
import { useAppStore } from "@/store/app.store";

type Section =
    | "General"
    | "Appearance"
    | "Providers & Keys"
    | "Cascade"
    | "Models"
    | "Storage"
    | "Shortcuts"
    | "About";

const SECTIONS: Section[] = [
    "General",
    "Appearance",
    "Providers & Keys",
    "Cascade",
    "Models",
    "Storage",
    "Shortcuts",
    "About"
];

const PROVIDERS = [
    "anthropic",
    "openai",
    "google",
    "groq",
    "ollama",
    "stability",
    "brave",
    "serpapi"
];

interface KeyMeta {
    provider: string;
    hint: string;
    savedAt: string;
}

export function SettingsPage() {
    const [section, setSection] = useState<Section>("Providers & Keys");

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* Settings sidebar */}
            <div
                style={{
                    width: 180,
                    flexShrink: 0,
                    borderRight: `1px solid ${C.border}`,
                    padding: "12px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }}
            >
                {SECTIONS.map(s => (
                    <button
                        key={s}
                        onClick={() => setSection(s)}
                        style={{
                            width: "100%",
                            padding: "7px 16px",
                            background: section === s ? C.surface2 : "none",
                            border: "none",
                            cursor: "pointer",
                            color: section === s ? C.text : C.dim,
                            fontSize: 13,
                            textAlign: "left",
                            fontFamily: C.sans,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                        }}
                    >
                        {s}
                        {section === s && (
                            <ChevronRight
                                size={11}
                                color={C.dim}
                                style={{ marginLeft: "auto" }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
                {section === "Providers & Keys" && <KeysSection />}
                {section === "General" && <GeneralSection />}
                {section === "About" && <AboutSection />}
                {!["Providers & Keys", "General", "About"].includes(
                    section
                ) && (
                    <div style={{ color: C.dim, fontSize: 13 }}>
                        {section} settings coming soon.
                    </div>
                )}
            </div>
        </div>
    );
}

function KeysSection() {
    const [keys, setKeys] = useState<KeyMeta[]>([]);
    const [provider, setProvider] = useState("anthropic");
    const [keyVal, setKeyVal] = useState("");
    const [testing, setTesting] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<Record<string, "ok" | "fail">>(
        {}
    );
    const { pushTerminalLine } = useAppStore();

    const load = () =>
        getKeys()
            .then(setKeys)
            .catch(() => {});
    useEffect(() => {
        load();
    }, []);

    const handleSave = async () => {
        if (!keyVal.trim()) return;
        try {
            await saveKey(provider, keyVal.trim());
            setKeyVal("");
            load();
            pushTerminalLine({
                text: `[keys] saved ${provider} key`,
                type: "success"
            });
        } catch (e) {
            pushTerminalLine({
                text: `[keys] error: ${String(e)}`,
                type: "error"
            });
        }
    };

    const handleDelete = async (p: string) => {
        await deleteKey(p).catch(() => {});
        load();
        pushTerminalLine({ text: `[keys] removed ${p}`, type: "dim" });
    };

    const handleTest = async (p: string, hint: string) => {
        setTesting(p);
        try {
            await introspectKey(p, hint);
            setTestResult(r => ({ ...r, [p]: "ok" }));
            pushTerminalLine({ text: `[keys] ${p} · valid`, type: "success" });
        } catch {
            setTestResult(r => ({ ...r, [p]: "fail" }));
            pushTerminalLine({ text: `[keys] ${p} · invalid`, type: "error" });
        }
        setTesting(null);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                maxWidth: 640
            }}
        >
            <div>
                <h2
                    style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: C.text,
                        marginBottom: 4
                    }}
                >
                    Providers &amp; Keys
                </h2>
                <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>
                    Keys are stored encrypted locally. They never leave your
                    machine.
                </p>
            </div>

            {/* Saved keys list — matches Image 2 settings panel */}
            <div
                style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    overflow: "hidden"
                }}
            >
                {keys.length === 0 ? (
                    <div
                        style={{ padding: "16px", fontSize: 12, color: C.dim }}
                    >
                        No keys saved yet.
                    </div>
                ) : (
                    keys.map(k => (
                        <div
                            key={k.provider}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 14px",
                                borderBottom: `1px solid ${C.border}`
                            }}
                        >
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background:
                                        testResult[k.provider] === "ok"
                                            ? C.green
                                            : testResult[k.provider] === "fail"
                                              ? C.red
                                              : C.dim,
                                    flexShrink: 0
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 12,
                                    color: C.text,
                                    width: 90,
                                    flexShrink: 0
                                }}
                            >
                                {k.provider}
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    color: C.dim,
                                    fontFamily: C.mono,
                                    flex: 1
                                }}
                            >
                                {k.hint}···········
                            </span>
                            <button
                                onClick={() => handleTest(k.provider, k.hint)}
                                disabled={testing === k.provider}
                                style={{
                                    fontSize: 10,
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    background: C.blueDim,
                                    border: `1px solid ${C.blueBdr}`,
                                    color: C.blue,
                                    fontFamily: C.sans,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                }}
                            >
                                <TestTube2 size={9} />
                                {testing === k.provider ? "…" : "Test"}
                            </button>
                            <button
                                onClick={() => handleDelete(k.provider)}
                                style={{
                                    fontSize: 10,
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    background: C.redDim,
                                    border: `1px solid ${C.redBdr}`,
                                    color: C.red,
                                    fontFamily: C.sans,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                }}
                            >
                                <Trash2 size={9} />
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add key form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                    style={{
                        fontSize: 11,
                        color: C.dim,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em"
                    }}
                >
                    Add key
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                    <select
                        value={provider}
                        onChange={e => setProvider(e.target.value)}
                        style={{
                            background: C.surface,
                            border: `1px solid ${C.border2}`,
                            borderRadius: 6,
                            padding: "8px 10px",
                            color: C.text,
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: C.sans,
                            flexShrink: 0
                        }}
                    >
                        {PROVIDERS.map(p => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                    <input
                        type="password"
                        value={keyVal}
                        onChange={e => setKeyVal(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSave()}
                        placeholder="sk-… or api key"
                        style={{
                            flex: 1,
                            background: C.surface,
                            border: `1px solid ${C.border2}`,
                            borderRadius: 6,
                            padding: "8px 10px",
                            color: C.text,
                            fontSize: 12,
                            fontFamily: C.mono,
                            outline: "none"
                        }}
                    />
                    <button
                        onClick={handleSave}
                        disabled={!keyVal.trim()}
                        style={{
                            padding: "8px 14px",
                            borderRadius: 6,
                            cursor: keyVal.trim() ? "pointer" : "default",
                            background: keyVal.trim() ? C.blue : C.surface2,
                            border: "none",
                            color: keyVal.trim() ? "white" : C.dim,
                            fontSize: 12,
                            fontFamily: C.sans,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 5
                        }}
                    >
                        <Plus size={12} />
                        Save
                    </button>
                </div>
            </div>

            {/* Environment fallback note */}
            <div
                style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 7,
                    padding: "12px 14px"
                }}
            >
                <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.7 }}>
                    Environment variable fallbacks:{" "}
                    <span style={{ color: C.sub, fontFamily: C.mono }}>
                        ANTHROPIC_API_KEY
                    </span>
                    ,{" "}
                    <span style={{ color: C.sub, fontFamily: C.mono }}>
                        OPENAI_API_KEY
                    </span>
                    , etc. are also read at startup. UI keys override env vars.
                </p>
                <button
                    style={{
                        marginTop: 10,
                        padding: "6px 12px",
                        borderRadius: 5,
                        background: C.surface2,
                        border: `1px solid ${C.border2}`,
                        color: C.sub,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: C.sans
                    }}
                >
                    Run migration
                </button>
            </div>
        </div>
    );
}

function GeneralSection() {
    return (
        <div style={{ maxWidth: 480 }}>
            <h2
                style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.text,
                    marginBottom: 16
                }}
            >
                General
            </h2>
            <div style={{ color: C.dim, fontSize: 13 }}>
                General settings coming soon.
            </div>
        </div>
    );
}

function AboutSection() {
    return (
        <div
            style={{
                maxWidth: 480,
                display: "flex",
                flexDirection: "column",
                gap: 14
            }}
        >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                About
            </h2>
            {[
                ["Version", "v0.3.12"],
                ["License", "MIT"],
                ["Stack", "Bun · Hono · React"],
                ["Gateway", "localhost:4000"],
                ["Repo", "github.com/picklem0b/Conduit"]
            ].map(([k, v]) => (
                <div
                    key={k}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0,
                        padding: "9px 0",
                        borderBottom: `1px solid ${C.border}`
                    }}
                >
                    <span
                        style={{
                            fontSize: 12,
                            color: C.dim,
                            width: 100,
                            flexShrink: 0
                        }}
                    >
                        {k}
                    </span>
                    <span
                        style={{
                            fontSize: 12,
                            color: C.sub,
                            fontFamily: C.mono
                        }}
                    >
                        {v}
                    </span>
                </div>
            ))}
            <p style={{ fontSize: 11, color: C.dimmer, lineHeight: 1.6 }}>
                Conduit v0.3.12 · MIT · Built with Bun + Hono + React
            </p>
        </div>
    );
}
