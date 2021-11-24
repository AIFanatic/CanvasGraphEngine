import { IMouseEvent } from "../interfaces/IMouseEvent";
import { INodeWidget } from "../interfaces/INodeWidget";
import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";
import { GraphNode } from "../node/GraphNode";
export declare class ButtonWidget implements INodeWidget {
    properties: INodeWidgetProperties;
    private node;
    private color;
    private isMouseInside;
    private callback;
    constructor(node: GraphNode, callback: () => void);
    onMouseDown(event: IMouseEvent): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
