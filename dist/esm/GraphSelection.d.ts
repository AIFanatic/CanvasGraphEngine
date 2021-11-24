import { Graph } from "./Graph";
import { INodeConnectionProperties } from "./interfaces/INodeConnectionProperties";
import { IMouseEvent } from "./interfaces/IMouseEvent";
export declare class GraphSelection {
    connectionProperties: INodeConnectionProperties;
    private graph;
    private selectedNode;
    private selectedSlotFrom;
    private selectedSlotTo;
    private selectedNodePositionOffset;
    private mousePosition;
    private slotRadiusMultiplier;
    private isTouch;
    constructor(graph: Graph);
    draw(ctx: CanvasRenderingContext2D): void;
    private bringNodeToForeground;
    onMouseDown(event: IMouseEvent): void;
    onMouseUp(event: IMouseEvent): void;
    onMouseMove(event: IMouseEvent): boolean;
}
