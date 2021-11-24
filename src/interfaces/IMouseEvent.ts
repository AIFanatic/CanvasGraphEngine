import { IPosition } from "./IPosition";

export enum MouseEventTypes {
    DOWN,
    UP,
    MOVE,
    WHEEL
}

export enum MouseButton {
    LEFT,
    MIDDLE,
    RIGHT,
    BACK,
    FORWARD,
}

export interface IMouseEvent {
    position: IPosition;
    button: MouseButton;
    wheelDelta?: number;
    rawEvent: MouseEvent | TouchEvent | WheelEvent;
}