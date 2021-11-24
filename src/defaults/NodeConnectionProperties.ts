import { INodeConnectionProperties } from "../interfaces/INodeConnectionProperties";

export class NodeConnectionProperties {
    static default(): INodeConnectionProperties {
        return {
            color: "inherit",
            thickness: 3,
        }
    }
}