import { IMouseEvent } from "./IMouseEvent";
import { INodeWidgetProperties } from "./INodeWidgetProperties";

export interface INodeWidget {
    properties: INodeWidgetProperties;
    draw?: (ctx: CanvasRenderingContext2D) => void;

    onMouseUp?: (event: IMouseEvent) => void;
    onMouseDown?: (event: IMouseEvent) => void;
    onMouseMove?: (event: IMouseEvent) => void;
    onMouseWheel?: (event: IMouseEvent) => void;
}