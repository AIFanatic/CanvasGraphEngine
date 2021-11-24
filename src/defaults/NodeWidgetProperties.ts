import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";

export class NodeWidgetProperties {
    static default(): INodeWidgetProperties {
        return {
            position: {x: 0, y: 0},
            size: {w: 200, h: 20},
            color: "#333333",
            name: "",
            value: "",
            topMargin: 5,
            sideMargin: 5
        }
    }
}