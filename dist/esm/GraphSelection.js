import { NodeConnectionProperties } from "./defaults/NodeConnectionProperties";
import { Utils } from "./Utils";
import { MouseButton } from "./interfaces/IMouseEvent";
var GraphSelection = /** @class */ (function () {
    function GraphSelection(graph) {
        this.slotRadiusMultiplier = 2;
        this.graph = graph;
        this.connectionProperties = NodeConnectionProperties.default();
        this.mousePosition = { x: 0, y: 0 };
    }
    GraphSelection.prototype.draw = function (ctx) {
        ctx.save();
        if (this.selectedNode && !this.selectedSlotFrom) {
            ctx.strokeStyle = "#949494";
            ctx.strokeRect(this.selectedNode.properties.position.x, this.selectedNode.properties.position.y, this.selectedNode.properties.size.w, this.selectedNode.properties.size.h);
        }
        if (this.selectedSlotFrom) {
            ctx.strokeStyle = this.connectionProperties.color == "inherit" ? this.selectedSlotFrom.properties.slotColor : this.connectionProperties.color;
            ctx.lineWidth = this.connectionProperties.thickness;
            ctx.beginPath();
            ctx.moveTo(this.selectedSlotFrom.slotCenter.x, this.selectedSlotFrom.slotCenter.y);
            ctx.lineTo(this.mousePosition.x, this.mousePosition.y);
            ctx.stroke();
        }
        ctx.restore();
    };
    GraphSelection.prototype.bringNodeToForeground = function (node) {
        var nodeIndex = this.graph.nodes.indexOf(node);
        if (nodeIndex != -1) {
            var foregroundNode = this.graph.nodes.splice(nodeIndex, 1)[0];
            this.graph.nodes.push(foregroundNode);
        }
    };
    GraphSelection.prototype.onMouseDown = function (event) {
        this.mousePosition = event.position;
        this.isTouch = event.rawEvent instanceof TouchEvent;
        for (var _i = 0, _a = this.graph.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (Utils.isPointInsideRect(node.properties.position, node.properties.size, event.position)) {
                this.selectedNode = node;
                this.selectedNodePositionOffset = { x: event.position.x - this.selectedNode.properties.position.x, y: event.position.y - this.selectedNode.properties.position.y };
                this.bringNodeToForeground(this.selectedNode);
                for (var _b = 0, _c = node.outputs; _b < _c.length; _b++) {
                    var output = _c[_b];
                    var isSlotSelected = Utils.isPointInsideCircle(event.position, output.slotCenter, output.properties.slotRadius * this.slotRadiusMultiplier);
                    if (isSlotSelected) {
                        this.selectedSlotFrom = output;
                        break;
                    }
                }
                for (var _d = 0, _e = node.inputs; _d < _e.length; _d++) {
                    var input = _e[_d];
                    if (input.connection) {
                        var isSlotSelected = Utils.isPointInsideCircle(event.position, input.slotCenter, input.properties.slotRadius * this.slotRadiusMultiplier);
                        if (isSlotSelected) {
                            input.node.removeConnection(input.connection);
                            break;
                        }
                    }
                }
            }
        }
    };
    GraphSelection.prototype.onMouseUp = function (event) {
        this.mousePosition = event.position;
        if (this.selectedNode && this.selectedSlotFrom && this.selectedSlotTo) {
            this.selectedSlotTo.isHighlighted = false;
            this.selectedNode.connectInputToOutput(this.selectedSlotFrom, this.selectedSlotTo);
        }
        this.selectedNode = null;
        this.selectedSlotFrom = null;
        this.selectedSlotTo = null;
    };
    GraphSelection.prototype.onMouseMove = function (event) {
        this.mousePosition = event.position;
        this.selectedSlotTo = null;
        if (this.selectedSlotFrom) {
            for (var _i = 0, _a = this.graph.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                if (node == this.selectedNode)
                    continue;
                if (Utils.isPointInsideRect(node.properties.position, node.properties.size, event.position)) {
                    for (var _b = 0, _c = node.inputs; _b < _c.length; _b++) {
                        var input = _c[_b];
                        input.isHighlighted = false;
                        var isMouseInsideSlot = Utils.isPointInsideCircle(event.position, input.slotCenter, input.properties.slotRadius * this.slotRadiusMultiplier);
                        if (isMouseInsideSlot) {
                            if (this.selectedNode.isValidConnection(input, this.selectedSlotFrom)) {
                                input.isHighlighted = true;
                                this.selectedSlotTo = input;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (this.selectedNode && !this.selectedSlotFrom) {
            if (event.button == MouseButton.LEFT) {
                this.selectedNode.properties.position.x = event.position.x - this.selectedNodePositionOffset.x;
                this.selectedNode.properties.position.y = event.position.y - this.selectedNodePositionOffset.y;
            }
        }
        if (this.selectedNode || this.selectedSlotFrom || this.selectedSlotTo) {
            return false;
        }
        return true;
    };
    return GraphSelection;
}());
export { GraphSelection };
//# sourceMappingURL=GraphSelection.js.map