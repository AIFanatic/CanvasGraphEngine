import { Utils } from "../Utils";
import { INodeProperties } from "../interfaces/INodeProperties";

export class NodeProperties {
    static default(): INodeProperties {
        return {
            uuid: Utils.uuid(),
            path: "",
            color: "#353535",
            position: {x: 0, y: 0},
            size: {w: 200, h: 50},
            horizontalSlots: false,
        }
    }
}