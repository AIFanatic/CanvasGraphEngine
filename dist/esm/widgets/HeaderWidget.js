import { NodeWidgetProperties } from "../defaults/NodeWidgetProperties";
var HeaderWidget = /** @class */ (function () {
    function HeaderWidget(title) {
        this.properties = NodeWidgetProperties.default();
        this.properties.name = title;
    }
    HeaderWidget.prototype.draw = function (ctx, x, y) {
        ctx.save();
        this.properties.position = { x: x, y: y };
        ctx.fillStyle = this.properties.color;
        ctx.fillRect(this.properties.position.x, this.properties.position.y, this.properties.size.w, this.properties.size.h);
        ctx.fillStyle = "gray";
        ctx.font = "10pt Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(this.properties.name, this.properties.position.x + 10 * 2, this.properties.position.y + this.properties.size.h / 2 + 1);
        ctx.strokeStyle = "#262626";
        ctx.beginPath();
        ctx.moveTo(this.properties.position.x, y + this.properties.size.h);
        ctx.lineTo(this.properties.position.x + this.properties.size.w, y + this.properties.size.h);
        ctx.stroke();
        ctx.restore();
    };
    return HeaderWidget;
}());
export { HeaderWidget };
//# sourceMappingURL=HeaderWidget.js.map