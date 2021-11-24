import { IMouseEvent } from "../interfaces/IMouseEvent";
import { INodeWidget } from "../interfaces/INodeWidget";
import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";
import { GraphNode } from "../node/GraphNode";
export declare class TextWidget implements INodeWidget {
    properties: INodeWidgetProperties;
    onChange(): void;
    private node;
    private color;
    private ele;
    constructor(node: GraphNode);
    private onKeyDown;
    private doneEditing;
    onMouseDown(event: IMouseEvent): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
