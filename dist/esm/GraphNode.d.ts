import { Graph } from "./Graph";
import { GraphNodeConnection } from "./GraphNodeConnection";
import { GraphNodeInput } from "./GraphNodeInput";
import { GraphNodeOutput } from "./GraphNodeOutput";
import { INodeProperties } from "./interfaces/INodeProperties";
import { INodeWidget } from "./interfaces/INodeWidget";
import { HeaderWidget } from "./widgets/HeaderWidget";
export declare class GraphNode {
    graph: Graph;
    inputs: GraphNodeInput[];
    outputs: GraphNodeOutput[];
    widgets: INodeWidget[];
    properties: INodeProperties;
    header: HeaderWidget;
    onAction(): void;
    onConnectionsChange(from: GraphNodeOutput, to: GraphNodeInput): void;
    constructor(graph: Graph, title: string);
    addInput(name: string, type: string): GraphNodeInput;
    addOutput(name: string, type: string): GraphNodeOutput;
    removeInput(input: GraphNodeInput): void;
    removeOutput(output: GraphNodeOutput): void;
    addWidget(widget: INodeWidget): INodeWidget;
    removeWidget(widget: INodeWidget): void;
    triggerOutput(index: number): void;
    getInputData(index: number): any;
    getOutputData(index: number): any;
    setOutputData(index: number, data: any): void;
    connect(from: GraphNodeOutput, to: GraphNodeInput): GraphNodeConnection;
    isValidConnection(to: GraphNodeInput, from: GraphNodeOutput): boolean;
    removeConnection(connection: GraphNodeConnection): void;
    disconnectInput(index: number): void;
    disconnectOutput(index: number, targetNode?: GraphNode): void;
    private calculateNodeSize;
    private calculateSlotsSize;
    private calculateWidgetsSize;
    drawConnections(ctx: CanvasRenderingContext2D): void;
    draw(ctx: CanvasRenderingContext2D): void;
}