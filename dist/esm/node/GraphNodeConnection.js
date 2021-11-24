import { NodeConnectionProperties } from "../defaults/NodeConnectionProperties";
var GraphNodeConnection = /** @class */ (function () {
    function GraphNodeConnection(input, output) {
        this.dashOffset = 0;
        this.input = input;
        this.output = output;
        var propertiesDefaults = NodeConnectionProperties.default();
        this.properties = {
            color: propertiesDefaults.color,
            thickness: propertiesDefaults.thickness,
            from_node: this.output.node.properties.uuid,
            from_slot: this.output.properties.uuid,
            to_node: this.input.node.properties.uuid,
            to_slot: this.input.properties.uuid
        };
    }
    GraphNodeConnection.prototype.trigger = function () {
        var _this = this;
        if (this.hasTriggered)
            return;
        this.hasTriggered = true;
        this.dashOffset = 0;
        var interval = setInterval(function () {
            _this.output.node.graph.dirtyCanvas = true;
            _this.dashOffset--;
        }, 100);
        setTimeout(function () {
            _this.hasTriggered = false;
            clearInterval(interval);
        }, 1000);
    };
    GraphNodeConnection.prototype.draw = function (ctx) {
        // Slot centers not set, refresh canvas until they are
        if ((this.input.slotCenter.x == 0 && this.input.slotCenter.y == 0) ||
            (this.output.slotCenter.x == 0 && this.output.slotCenter.y == 0)) {
            this.output.node.graph.dirtyCanvas = true;
            return;
        }
        ctx.save();
        ctx.strokeStyle = this.properties.color == "inherit" ? this.input.properties.slotColor : this.properties.color;
        if (this.hasTriggered) {
            ctx.strokeStyle = "white";
            ctx.setLineDash([4, 4]);
            ctx.lineDashOffset = this.dashOffset;
        }
        ctx.lineWidth = this.properties.thickness;
        ctx.beginPath();
        ctx.moveTo(this.output.slotCenter.x, this.output.slotCenter.y);
        var outputIsVertical = this.output.node.properties.horizontalSlots;
        var inputIsVertical = this.input.node.properties.horizontalSlots;
        if (outputIsVertical && inputIsVertical) {
            ctx.lineTo(this.output.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
            ctx.lineTo(this.input.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
        }
        else if (!outputIsVertical && inputIsVertical) {
            ctx.lineTo(this.input.slotCenter.x, this.output.slotCenter.y);
            ctx.lineTo(this.input.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
        }
        else if (outputIsVertical && !inputIsVertical) {
            ctx.lineTo(this.output.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
            ctx.lineTo(this.output.slotCenter.x, this.input.slotCenter.y);
        }
        else if (!outputIsVertical && !inputIsVertical) {
            ctx.lineTo((this.output.slotCenter.x + this.input.slotCenter.x) * 0.5, this.output.slotCenter.y);
            ctx.lineTo((this.output.slotCenter.x + this.input.slotCenter.x) * 0.5, this.input.slotCenter.y);
        }
        ctx.lineTo(this.input.slotCenter.x, this.input.slotCenter.y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    };
    return GraphNodeConnection;
}());
export { GraphNodeConnection };
//# sourceMappingURL=GraphNodeConnection.js.map