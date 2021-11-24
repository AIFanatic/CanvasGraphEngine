import { GraphNode } from "./GraphNode";
import { GraphNodeConnection } from "./GraphNodeConnection";
import { INodeSlotProperties } from "./interfaces/INodeSlotProperties";
import { IPosition } from "./interfaces/IPosition";
export declare class GraphNodeInput {
    properties: INodeSlotProperties;
    slotCenter: IPosition;
    node: GraphNode;
    connection: GraphNodeConnection;
    isHighlighted: boolean;
    constructor(node: GraphNode);
    removeConnection(): void;
    setConnection(connection: GraphNodeConnection): void;
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
}
