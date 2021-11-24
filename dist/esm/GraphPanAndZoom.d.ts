import { IMouseEvent } from "./interfaces/IMouseEvent";
import { IPosition } from "./interfaces/IPosition";
export declare class GraphPanAndZoom {
    private ctx;
    private dragStart;
    private transform;
    private _point;
    private scaleFactor;
    private initialPinchDistance;
    private prevDistance;
    constructor(ctx: CanvasRenderingContext2D, scaleFactor?: number);
    transformedPoint(x: number, y: number): IPosition;
    onMouseDown(event: IMouseEvent): void;
    onMouseUp(event: IMouseEvent): void;
    onMouseMove(event: IMouseEvent): void;
    onMouseWheel(event: IMouseEvent): void;
}
