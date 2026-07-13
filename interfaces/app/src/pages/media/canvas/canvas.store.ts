import { create } from "zustand";
import type { ToolType, CanvasLayer } from "./canvas.types";

interface CanvasStoreState {
    tool: ToolType;
    color: string;
    brushSize: number;
    zoom: number;
    layers: CanvasLayer[];
    activeLayer: string | null;
    setTool: (t: ToolType) => void;
    setColor: (c: string) => void;
    setBrushSize: (s: number) => void;
    setZoom: (z: number) => void;
    addLayer: () => void;
    toggleLayer: (id: string) => void;
    setActiveLayer: (id: string) => void;
}

let _lid = 0;

export const useCanvasStore = create<CanvasStoreState>(set => ({
    tool: "brush",
    color: "#ffffff",
    brushSize: 4,
    zoom: 100,
    layers: [
        {
            id: "bg",
            name: "Background",
            visible: true,
            locked: false,
            opacity: 100
        }
    ],
    activeLayer: "bg",
    setTool: tool => set({ tool }),
    setColor: color => set({ color }),
    setBrushSize: brushSize => set({ brushSize }),
    setZoom: zoom => set({ zoom }),
    addLayer: () =>
        set(s => {
            const id = `layer-${++_lid}`;
            return {
                layers: [
                    ...s.layers,
                    {
                        id,
                        name: `Layer ${_lid}`,
                        visible: true,
                        locked: false,
                        opacity: 100
                    }
                ],
                activeLayer: id
            };
        }),
    toggleLayer: id =>
        set(s => ({
            layers: s.layers.map(l =>
                l.id === id ? { ...l, visible: !l.visible } : l
            )
        })),
    setActiveLayer: activeLayer => set({ activeLayer })
}));
