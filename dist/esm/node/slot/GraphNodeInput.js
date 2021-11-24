import { NodeSlotProperties } from "../../defaults/NodeSlotProperties";
var GraphNodeInput = /** @class */ (function () {
    function GraphNodeInput(node) {
        this.connection = null;
        this.properties = NodeSlotProperties.default();
        this.properties.name = "input";
        this.slotCenter = { x: 0, y: 0 };
        this.node = node;
    }
    GraphNodeInput.prototype.removeConnection = function () {
        this.connection = null;
    };
    GraphNodeInput.prototype.setConnection = function (connection) {
        this.connection = connection;
    };
    GraphNodeInput.prototype.draw = function (ctx) {
        ctx.save();
        var margin = this.node.properties.horizontalSlots ? 0 : this.properties.margin;
        this.slotCenter = { x: this.properties.position.x + margin, y: this.properties.position.y + this.properties.size.h / 2 };
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
        if (this.connection) {
            ctx.beginPath();
            ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius - 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
        ctx.fillStyle = this.properties.textColor;
        ctx.font = "9pt Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(this.properties.name, this.slotCenter.x + 10, this.slotCenter.y);
        ctx.restore();
    };
    return GraphNodeInput;
}());
export { GraphNodeInput };
//# sourceMappingURL=GraphNodeInput.js.map