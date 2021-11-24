import { GraphNode } from "./GraphNode";
import { GraphNodeConnection } from "./GraphNodeConnection";
import { INodeSlotProperties } from "./interfaces/INodeSlotProperties";
import { IPosition } from "./interfaces/IPosition";
export declare class GraphNodeOutput {
    properties: INodeSlotProperties;
    slotCenter: IPosition;
    node: GraphNode;
    connections: GraphNodeConnection[];
    isHighlighted: boolean;
    constructor(node: GraphNode);
    removeConnection(connection: GraphNodeConnection): void;
    addConnection(connection: GraphNodeConnection): void;
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
}
