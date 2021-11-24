import { Utils } from "./Utils";
var GraphPanAndZoom = /** @class */ (function () {
    function GraphPanAndZoom(ctx, scaleFactor) {
        if (scaleFactor === void 0) { scaleFactor = 1.1; }
        this.initialPinchDistance = null;
        this.prevDistance = 0;
        this.ctx = ctx;
        this.scaleFactor = scaleFactor;
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        this.transform = svg.createSVGMatrix();
        this._point = svg.createSVGPoint();
    }
    GraphPanAndZoom.prototype.transformedPoint = function (x, y) {
        this._point.x = x;
        this._point.y = y;
        this._point = this._point.matrixTransform(this.transform.inverse());
        return { x: this._point.x, y: this._point.y };
    };
    GraphPanAndZoom.prototype.onMouseDown = function (event) {
        this.dragStart = event.position;
    };
    GraphPanAndZoom.prototype.onMouseUp = function (event) {
        this.dragStart = null;
    };
    GraphPanAndZoom.prototype.onMouseMove = function (event) {
        if (event.rawEvent instanceof TouchEvent && event.rawEvent.touches.length == 2) {
            event.rawEvent.preventDefault();
            var touch1 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
            var touch2 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
            var pointsMiddle = Utils.pointsMidPoint(touch1, touch2);
            var currentDistance = Utils.pointsDistance(touch1, touch2);
            if (this.initialPinchDistance == null) {
                this.initialPinchDistance = currentDistance;
                this.prevDistance = currentDistance;
                return;
            }
            var dist = currentDistance / this.initialPinchDistance;
            event.wheelDelta = (dist - this.prevDistance > 0 ? -dist : dist) * 10;
            event.position = this.transformedPoint(pointsMiddle.x, pointsMiddle.y);
            this.onMouseWheel(event);
            this.prevDistance = dist;
        }
        else {
            if (this.dragStart) {
                var dx = event.position.x - this.dragStart.x;
                var dy = event.position.y - this.dragStart.y;
                this.transform = this.transform.translate(dx, dy);
                this.ctx.translate(dx, dy);
            }
        }
    };
    GraphPanAndZoom.prototype.onMouseWheel = function (event) {
        var delta = -event.wheelDelta / 40;
        if (delta) {
            var factor = Math.pow(this.scaleFactor, delta);
            var pt = event.position;
            this.ctx.translate(pt.x, pt.y);
            this.ctx.scale(factor, factor);
            this.ctx.translate(-pt.x, -pt.y);
            this.transform = this.transform.translate(pt.x, pt.y);
            this.transform = this.transform.scaleNonUniform(factor, factor);
            this.transform = this.transform.translate(-pt.x, -pt.y);
        }
    };
    return GraphPanAndZoom;
}());
export { GraphPanAndZoom };
//# sourceMappingURL=GraphPanAndZoom.js.map