import { GraphNodeInput } from "./slot/GraphNodeInput";
import { GraphNodeOutput } from "./slot/GraphNodeOutput";
import { INodeConnectionProperties } from "../interfaces/INodeConnectionProperties";
export declare class GraphNodeConnection {
    input: GraphNodeInput;
    output: GraphNodeOutput;
    properties: INodeConnectionProperties;
    private hasTriggered;
    private dashOffset;
    constructor(input: GraphNodeInput, output: GraphNodeOutput);
    trigger(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
