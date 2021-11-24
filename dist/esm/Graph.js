import { Utils } from "./Utils";
import { GraphPanAndZoom } from "./GraphPanAndZoom";
import { GraphSelection } from "./GraphSelection";
import { GraphSerializer } from "./GraphSerializer";
import { MouseEventTypes } from "./interfaces/IMouseEvent";
var Graph = /** @class */ (function () {
    function Graph(canvas) {
        var _this = this;
        this.nodes = [];
        this.dirtyCanvas = true;
        this.panAndZoomEnabled = true;
        this.nodeSelectionEnabled = true;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        canvas.addEventListener("mousedown", function (event) { return _this.onMouseOrTouchDown(event); });
        canvas.addEventListener("mouseup", function (event) { return _this.onMouseOrTouchUp(event); });
        canvas.addEventListener("mousemove", function (event) { return _this.onMouseOrTouchMove(event); });
        canvas.addEventListener("wheel", function (event) { return _this.onMouseWheel(event); });
        canvas.addEventListener("touchstart", function (event) { return _this.onMouseOrTouchDown(event); });
        canvas.addEventListener("touchend", function (event) { return _this.onMouseOrTouchUp(event); });
        canvas.addEventListener("touchmove", function (event) { return _this.onMouseOrTouchMove(event); });
        window.addEventListener("resize", function (event) { return _this.onResize(event); });
        this.graphPanAndZoom = new GraphPanAndZoom(this.ctx);
        this.graphSelection = new GraphSelection(this);
        this.nodeTypes = new Map();
        requestAnimationFrame(function () { _this.draw(_this.ctx); });
        this.onResize(null);
    }
    Graph.prototype.registerNode = function (path, node) {
        this.nodeTypes.set(path, node);
    };
    Graph.prototype.unregisterNode = function (path) {
        this.nodeTypes.delete(path);
    };
    Graph.prototype.clearNodes = function () {
        this.nodes = [];
        this.dirtyCanvas = true;
    };
    Graph.prototype.createNode = function (path, title) {
        if (title === void 0) { title = ""; }
        if (this.nodeTypes.has(path)) {
            var Node_1 = this.nodeTypes.get(path);
            var nodeInstance = new Node_1(this, path, title);
            this.nodes.push(nodeInstance);
            nodeInstance.onAdded();
            return nodeInstance;
        }
        return null;
    };
    Graph.prototype.draw = function (ctx) {
        var _this = this;
        if (this.dirtyCanvas) {
            this.dirtyCanvas = false;
            // Clear the entire canvas
            var p1 = this.graphPanAndZoom.transformedPoint(0, 0);
            var p2 = this.graphPanAndZoom.transformedPoint(ctx.canvas.width, ctx.canvas.height);
            ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            // Connections first so they stay in background, not efficient.
            for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                node.drawConnections(ctx);
            }
            for (var _b = 0, _c = this.nodes; _b < _c.length; _b++) {
                var node = _c[_b];
                node.draw(ctx);
            }
            this.graphSelection.draw(ctx);
        }
        requestAnimationFrame(function () { _this.draw(_this.ctx); });
    };
    Graph.prototype.processMouseOrTouchEvent = function (event, type) {
        var mouseEvent = { position: { x: 0, y: 0 }, button: 0, rawEvent: event };
        if (event instanceof MouseEvent) {
            mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.offsetX, event.offsetY);
            mouseEvent.button = event.button;
        }
        if (event instanceof TouchEvent) {
            var canvasBoundingRect = this.canvas.getBoundingClientRect();
            mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.changedTouches[0].clientX - canvasBoundingRect.x, event.changedTouches[0].clientY - canvasBoundingRect.y);
        }
        if (event instanceof WheelEvent) {
            mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.offsetX, event.offsetY);
            mouseEvent.button = event.button;
            mouseEvent.wheelDelta = event.deltaY;
        }
        this.dirtyCanvas = true;
        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            node.onMouseEvent(mouseEvent, type);
        }
        return mouseEvent;
    };
    Graph.prototype.onMouseWheel = function (event) {
        var mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.WHEEL);
        if (this.panAndZoomEnabled)
            this.graphPanAndZoom.onMouseWheel(mouseEvent);
        event.preventDefault();
    };
    Graph.prototype.onMouseOrTouchUp = function (event) {
        var mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.UP);
        this.graphPanAndZoom.onMouseUp(mouseEvent);
        this.graphSelection.onMouseUp(mouseEvent);
    };
    Graph.prototype.onMouseOrTouchDown = function (event) {
        var mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.DOWN);
        if (this.panAndZoomEnabled)
            this.graphPanAndZoom.onMouseDown(mouseEvent);
        if (this.nodeSelectionEnabled)
            this.graphSelection.onMouseDown(mouseEvent);
    };
    Graph.prototype.onMouseOrTouchMove = function (event) {
        var mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.MOVE);
        var graphSelectionBubble = this.graphSelection.onMouseMove(mouseEvent);
        if (graphSelectionBubble) {
            this.graphPanAndZoom.onMouseMove(mouseEvent);
        }
        event.preventDefault();
    };
    Graph.prototype.onResize = function (event) {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        Utils.scaleCanvas(this.canvas, this.ctx, this.canvas.width, this.canvas.height);
        this.graphPanAndZoom = new GraphPanAndZoom(this.ctx);
        this.dirtyCanvas = true;
    };
    Graph.prototype.toJSON = function () {
        return GraphSerializer.toJSON(this);
    };
    Graph.prototype.fromJSON = function (serialized) {
        GraphSerializer.fromJSON(this, serialized);
    };
    return Graph;
}());
export { Graph };
//# sourceMappingURL=Graph.js.map