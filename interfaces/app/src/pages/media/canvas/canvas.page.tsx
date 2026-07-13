import { useRef, useEffect } from "react";
import {
    MousePointer2,
    Brush,
    Eraser,
    Square,
    Circle,
    Type,
    Move,
    Plus,
    Eye,
    EyeOff,
    Lock,
    Download
} from "lucide-react";
import { C } from "@/lib/tokens";
import { useCanvasStore } from "./canvas.store";
import type { ToolType } from "./canvas.types";

const TOOLS: { id: ToolType; icon: React.ReactNode; tip: string }[] = [
    { id: "select", icon: <MousePointer2 size={14} />, tip: "Select" },
    { id: "brush", icon: <Brush size={14} />, tip: "Brush" },
    { id: "eraser", icon: <Eraser size={14} />, tip: "Eraser" },
    { id: "rect", icon: <Square size={14} />, tip: "Rectangle" },
    { id: "circle", icon: <Circle size={14} />, tip: "Circle" },
    { id: "text", icon: <Type size={14} />, tip: "Text" },
    { id: "pan", icon: <Move size={14} />, tip: "Pan" }
];

export function CanvasPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
        tool,
        setTool,
        color,
        setColor,
        brushSize,
        zoom,
        layers,
        activeLayer,
        setActiveLayer,
        toggleLayer,
        addLayer
    } = useCanvasStore();
    const painting = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startPaint = (e: React.MouseEvent) => {
        if (tool !== "brush" && tool !== "eraser") return;
        painting.current = true;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const paint = (e: React.MouseEvent) => {
        if (!painting.current) return;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        ctx.strokeStyle = tool === "eraser" ? "#111" : color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopPaint = () => {
        painting.current = false;
    };

    const exportCanvas = () => {
        const link = document.createElement("a");
        link.download = "canvas.png";
        link.href = canvasRef.current?.toDataURL() ?? "";
        link.click();
    };

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* Tool bar */}
            <div
                style={{
                    width: 44,
                    flexShrink: 0,
                    borderRight: `1px solid ${C.border}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px 0",
                    gap: 3,
                    background: C.bg
                }}
            >
                {TOOLS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        title={t.tip}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            background: tool === t.id ? C.surface2 : "none",
                            color: tool === t.id ? C.text : C.dim,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.12s"
                        }}
                    >
                        {t.icon}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                {/* Color picker */}
                <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    style={{
                        width: 26,
                        height: 26,
                        borderRadius: 4,
                        border: "none",
                        cursor: "pointer",
                        padding: 0
                    }}
                />
                <button
                    onClick={exportCanvas}
                    title="Export"
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background: "none",
                        color: C.dim,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Download size={13} />
                </button>
            </div>

            {/* Canvas area */}
            <div
                style={{
                    flex: 1,
                    overflow: "auto",
                    background: "#0a0a0a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{
                        border: `1px solid ${C.border}`,
                        cursor:
                            tool === "pan"
                                ? "grab"
                                : tool === "eraser"
                                  ? "cell"
                                  : "crosshair"
                    }}
                    onMouseDown={startPaint}
                    onMouseMove={paint}
                    onMouseUp={stopPaint}
                    onMouseLeave={stopPaint}
                />
            </div>

            {/* Layer panel */}
            <div
                style={{
                    width: 180,
                    flexShrink: 0,
                    borderLeft: `1px solid ${C.border}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        padding: "8px 10px",
                        borderBottom: `1px solid ${C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <span
                        style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}
                    >
                        Layers
                    </span>
                    <button
                        onClick={addLayer}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.dim
                        }}
                    >
                        <Plus size={13} />
                    </button>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                    {[...layers].reverse().map(layer => (
                        <div
                            key={layer.id}
                            onClick={() => setActiveLayer(layer.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                padding: "7px 10px",
                                cursor: "pointer",
                                background:
                                    activeLayer === layer.id
                                        ? C.surface2
                                        : "none",
                                borderBottom: `1px solid ${C.border}`
                            }}
                        >
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    toggleLayer(layer.id);
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: C.dim,
                                    display: "flex"
                                }}
                            >
                                {layer.visible ? (
                                    <Eye size={11} />
                                ) : (
                                    <EyeOff size={11} />
                                )}
                            </button>
                            <span
                                style={{
                                    fontSize: 11,
                                    color:
                                        activeLayer === layer.id
                                            ? C.text
                                            : C.sub,
                                    flex: 1
                                }}
                            >
                                {layer.name}
                            </span>
                            {layer.locked && <Lock size={9} color={C.dim} />}
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        padding: "8px 10px",
                        borderTop: `1px solid ${C.border}`
                    }}
                >
                    <div style={{ fontSize: 9, color: C.dim, marginBottom: 4 }}>
                        Brush size: {brushSize}px
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={40}
                        value={brushSize}
                        onChange={e =>
                            useCanvasStore
                                .getState()
                                .setBrushSize(Number(e.target.value))
                        }
                        style={{ width: "100%", accentColor: C.blue }}
                    />
                </div>
            </div>
        </div>
    );
}
