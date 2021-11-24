import { NodeSlotProperties } from "./defaults/NodeSlotProperties";
var GraphNodeOutput = /** @class */ (function () {
    function GraphNodeOutput(node) {
        this.connections = [];
        this.properties = NodeSlotProperties.default();
        this.properties.name = "output";
        this.slotCenter = { x: 0, y: 0 };
        this.node = node;
    }
    GraphNodeOutput.prototype.removeConnection = function (connection) {
        var connectionIndex = this.connections.indexOf(connection);
        if (connectionIndex != -1) {
            this.connections.splice(connectionIndex, 1);
        }
    };
    GraphNodeOutput.prototype.addConnection = function (connection) {
        this.connections.push(connection);
    };
    GraphNodeOutput.prototype.draw = function (ctx, x, y) {
        ctx.save();
        this.properties.position = { x: x, y: y };
        this.slotCenter = { x: this.properties.position.x - this.properties.margin + this.properties.size.w, y: this.properties.position.y + this.properties.size.h / 2 };
        if (this.isHighlighted) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
        }
        else {
            ctx.fillStyle = this.properties.slotColor;
            ctx.strokeStyle = this.properties.slotColor;
        }
        ctx.beginPath();
        ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        if (this.connections.length > 0) {
            ctx.beginPath();
            ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius - 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
        ctx.fillStyle = this.properties.textColor;
        ctx.font = "9pt Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(this.properties.name, this.slotCenter.x - this.properties.margin, this.slotCenter.y);
        ctx.restore();
    };
    return GraphNodeOutput;
}());
export { GraphNodeOutput };
//# sourceMappingURL=GraphNodeOutput.js.map