import { INodeWidget } from "../interfaces/INodeWidget";
import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";
export interface INodeHeaderProperties extends INodeWidgetProperties {
    statusColor?: string;
}
export declare class NodeHeaderWidget implements INodeWidget {
    properties: INodeHeaderProperties;
    constructor(title: string);
    draw(ctx: CanvasRenderingContext2D): void;
}
