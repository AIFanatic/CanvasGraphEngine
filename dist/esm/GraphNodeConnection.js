import { NodeConnectionProperties } from "./defaults/NodeConnectionProperties";
var GraphNodeConnection = /** @class */ (function () {
    function GraphNodeConnection(input, output) {
        this.dashOffset = 0;
        this.input = input;
        this.output = output;
        this.properties = NodeConnectionProperties.default();
    }
    GraphNodeConnection.prototype.trigger = function () {
        var _this = this;
        this.hasTriggered = true;
        this.dashOffset = 0;
        var interval = setInterval(function () {
            _this.output.node.graph.dirtyCanvas = true;
            _this.dashOffset++;
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
        ctx.strokeStyle = this.properties.color;
        if (this.hasTriggered) {
            ctx.strokeStyle = "white";
            ctx.setLineDash([4, 2]);
            ctx.lineDashOffset = this.dashOffset;
        }
        ctx.lineWidth = this.properties.thickness;
        ctx.beginPath();
        ctx.moveTo(this.input.slotCenter.x, this.input.slotCenter.y);
        ctx.lineTo(this.output.slotCenter.x, this.output.slotCenter.y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    };
    return GraphNodeConnection;
}());
export { GraphNodeConnection };
//# sourceMappingURL=GraphNodeConnection.js.map