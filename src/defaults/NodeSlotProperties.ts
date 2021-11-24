import { Utils } from "../Utils";
import { INodeSlotProperties } from "../interfaces/INodeSlotProperties";

export class NodeSlotProperties {
    static default(): INodeSlotProperties {
        return {
            uuid: Utils.uuid(),
            position: {x: 0, y: 0},
            size: {w: 200, h: 20},
            name: "",
            value: "",
            type: "",
            slotColor: "#949494",
            slotRadius: 4,
            textColor: "#949494",
            margin: 10,
        }
    }
}