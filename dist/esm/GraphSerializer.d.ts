import { NodeWidgetProperties } from "./defaults/NodeWidgetProperties";
import { Graph } from "./Graph";
import { INodeProperties } from "./interfaces/INodeProperties";
import { INodeSlotProperties } from "./interfaces/INodeSlotProperties";
import { INodeWidgetProperties } from "./interfaces/INodeWidgetProperties";
import { INodeConnectionProperties } from "./interfaces/INodeConnectionProperties";
interface IGraphSerializeOutput {
    properties: INodeSlotProperties;
    connections: INodeConnectionProperties[];
}
export interface IGraphSerializeNode {
    node: INodeProperties;
    header: INodeWidgetProperties;
    inputs: INodeSlotProperties[];
    outputs: IGraphSerializeOutput[];
    widgets: NodeWidgetProperties[];
}
export declare class GraphSerializer {
    private static serializeNodeInputs;
    private static serializeNodeOutputs;
    private static serializeWidgets;
    private static serializeNode;
    static toJSON(graph: Graph): IGraphSerializeNode[];
    static fromJSON(graph: Graph, serialized: IGraphSerializeNode[]): void;
}
export {};
