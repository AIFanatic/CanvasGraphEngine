import { IPosition } from "./IPosition";
export declare enum MouseEventTypes {
    DOWN = 0,
    UP = 1,
    MOVE = 2,
    WHEEL = 3
}
export declare enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    BACK = 3,
    FORWARD = 4
}
export interface IMouseEvent {
    position: IPosition;
    button: MouseButton;
    wheelDelta?: number;
    rawEvent: MouseEvent | TouchEvent | WheelEvent;
}
