import { Utils } from "../Utils";
var NodeProperties = /** @class */ (function () {
    function NodeProperties() {
    }
    NodeProperties.default = function () {
        return {
            uuid: Utils.uuid(),
            path: "",
            color: "#353535",
            position: { x: 0, y: 0 },
            size: { w: 200, h: 50 },
            horizontalSlots: false,
        };
    };
    return NodeProperties;
}());
export { NodeProperties };
//# sourceMappingURL=NodeProperties.js.map