export type ToolType =
    | "select"
    | "brush"
    | "eraser"
    | "rect"
    | "circle"
    | "text"
    | "pan";

export interface CanvasLayer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
}

export interface CanvasState {
    width: number;
    height: number;
    layers: CanvasLayer[];
    activeLayer: string | null;
    tool: ToolType;
    color: string;
    brushSize: number;
    zoom: number;
}
