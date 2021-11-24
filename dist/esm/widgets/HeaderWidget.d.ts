import { INodeWidget } from "../interfaces/INodeWidget";
import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";
export declare class HeaderWidget implements INodeWidget {
    properties: INodeWidgetProperties;
    constructor(title: string);
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
}
