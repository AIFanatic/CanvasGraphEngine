import { IPosition } from "./interfaces/IPosition";
import { ISize } from "./interfaces/ISize";
export declare class Utils {
    static isPointInsideRect(position: IPosition, size: ISize, point: IPosition): boolean;
    static isPointInsideCircle(point: IPosition, center: IPosition, radius: number): boolean;
    static pointsDistance(p1: IPosition, p2: IPosition): number;
    static pointsMidPoint(p1: IPosition, p2: IPosition): IPosition;
    static lerp(a: number, b: number, t: number): number;
    static scaleCanvas(canvas: any, context: any, width: any, height: any): number;
    static uuid(): string;
}
