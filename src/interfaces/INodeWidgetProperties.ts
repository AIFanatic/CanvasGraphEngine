import { IPosition } from "./IPosition";
import { ISize } from "./ISize";

export interface INodeWidgetProperties {
    position: IPosition;
    size: ISize;
    color: string,
    name: string;
    value: any;
    topMargin: number;
    sideMargin: number;
}