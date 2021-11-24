import { IPosition } from "./IPosition";
import { ISize } from "./ISize";
export interface INodeSlotProperties {
    uuid: string;
    position: IPosition;
    size: ISize;
    name: string;
    value: any;
    type: string;
    slotColor: string;
    slotRadius: number;
    textColor: string;
    margin: number;
}
