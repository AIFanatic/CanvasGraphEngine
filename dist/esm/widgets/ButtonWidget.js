import { NodeWidgetProperties } from "../defaults/NodeWidgetProperties";
import { Utils } from "../Utils";
var ButtonWidget = /** @class */ (function () {
    function ButtonWidget(node, callback) {
        this.color = "#222222";
        this.properties = NodeWidgetProperties.default();
        this.properties.name = "Button";
        this.node = node;
        this.callback = callback;
    }
    ButtonWidget.prototype.onMouseDown = function (event) {
        var _this = this;
        this.isMouseInside = Utils.isPointInsideRect(this.properties.position, this.properties.size, event.position);
        if (this.isMouseInside) {
            this.node.graph.panAndZoomEnabled = false;
            this.node.graph.nodeSelectionEnabled = false;
            this.color = "#4d4d4d";
            this.node.graph.dirtyCanvas = true;
            setTimeout(function () {
                _this.node.graph.panAndZoomEnabled = true;
                _this.node.graph.nodeSelectionEnabled = true;
                _this.color = "#222222";
                _this.node.graph.dirtyCanvas = true;
            }, 100);
            this.callback();
        }
    };
    ButtonWidget.prototype.draw = function (ctx) {
        ctx.save();
        ctx.strokeStyle = "gray";
        ctx.fillStyle = this.color;
        ctx.strokeRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y, this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);
        ctx.fillRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y, this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);
        ctx.fillStyle = "white";
        ctx.font = "8pt Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.properties.name, this.properties.position.x + this.properties.size.w / 2, this.properties.position.y + this.properties.size.h / 2);
        ctx.restore();
    };
    return ButtonWidget;
}());
export { ButtonWidget };
//# sourceMappingURL=ButtonWidget.js.map