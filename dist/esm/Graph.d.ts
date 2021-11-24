import { GraphNode } from "./node/GraphNode";
import { IGraphSerializeNode } from "./GraphSerializer";
export declare class Graph {
    nodes: GraphNode[];
    dirtyCanvas: boolean;
    panAndZoomEnabled: boolean;
    nodeSelectionEnabled: boolean;
    private canvas;
    private ctx;
    private graphPanAndZoom;
    private graphSelection;
    private nodeTypes;
    constructor(canvas: HTMLCanvasElement);
    registerNode(path: string, node: typeof GraphNode): void;
    unregisterNode(path: string): void;
    clearNodes(): void;
    createNode(path: string, title?: string): GraphNode;
    private draw;
    private processMouseOrTouchEvent;
    private onMouseWheel;
    private onMouseOrTouchUp;
    private onMouseOrTouchDown;
    private onMouseOrTouchMove;
    private onResize;
    toJSON(): IGraphSerializeNode[];
    fromJSON(serialized: IGraphSerializeNode[]): void;
}
