import { NodeProperties } from "../defaults/NodeProperties";
import { GraphNodeConnection } from "./GraphNodeConnection";
import { GraphNodeInput } from "./slot/GraphNodeInput";
import { GraphNodeOutput } from "./slot/GraphNodeOutput";
import { NodeHeaderWidget } from "../widgets/NodeHeaderWidget";
import { MouseEventTypes } from "../interfaces/IMouseEvent";
var GraphNode = /** @class */ (function () {
    function GraphNode(graph, path, title) {
        var _this = this;
        this.inputs = [];
        this.outputs = [];
        this.widgets = [];
        this.onMouseEvent = function (event, type) {
            if (type == MouseEventTypes.UP && _this.onMouseUp)
                _this.onMouseUp(event);
            else if (type == MouseEventTypes.DOWN && _this.onMouseDown)
                _this.onMouseDown(event);
            else if (type == MouseEventTypes.MOVE && _this.onMouseMove)
                _this.onMouseMove(event);
            else if (type == MouseEventTypes.WHEEL && _this.onMouseWheel)
                _this.onMouseWheel(event);
            for (var _i = 0, _a = _this.widgets; _i < _a.length; _i++) {
                var widget = _a[_i];
                if (type == MouseEventTypes.UP && widget.onMouseUp)
                    widget.onMouseUp(event);
                else if (type == MouseEventTypes.DOWN && widget.onMouseDown)
                    widget.onMouseDown(event);
                else if (type == MouseEventTypes.MOVE && widget.onMouseMove)
                    widget.onMouseMove(event);
                else if (type == MouseEventTypes.WHEEL && widget.onMouseWheel)
                    widget.onMouseWheel(event);
            }
        };
        this.graph = graph;
        this.properties = NodeProperties.default();
        this.properties.path = path;
        this.header = new NodeHeaderWidget(title ? title : "");
    }
    GraphNode.prototype.onTrigger = function () { };
    ;
    GraphNode.prototype.onConnectionsChange = function (from, to) { };
    ;
    GraphNode.prototype.onAdded = function () { };
    ;
    GraphNode.prototype.onRemoved = function () { };
    ;
    GraphNode.prototype.onMouseUp = function (event) { };
    ;
    GraphNode.prototype.onMouseDown = function (event) { };
    ;
    GraphNode.prototype.onMouseMove = function (event) { };
    ;
    GraphNode.prototype.onMouseWheel = function (event) { };
    ;
    GraphNode.prototype.addInput = function (name, type) {
        var input = new GraphNodeInput(this);
        input.properties.name = name;
        input.properties.type = type;
        this.inputs.push(input);
        this.graph.dirtyCanvas = true;
        return input;
    };
    GraphNode.prototype.addOutput = function (name, type) {
        var output = new GraphNodeOutput(this);
        output.properties.name = name;
        output.properties.type = type;
        this.outputs.push(output);
        this.graph.dirtyCanvas = true;
        return output;
    };
    GraphNode.prototype.removeInput = function (input) {
        for (var i = 0; i < this.inputs.length; i++) {
            if (input == this.inputs[i]) {
                this.inputs.splice(i, 1);
                this.graph.dirtyCanvas = true;
                break;
            }
        }
    };
    GraphNode.prototype.removeOutput = function (output) {
        for (var i = 0; i < this.outputs.length; i++) {
            if (output == this.outputs[i]) {
                this.outputs.splice(i, 1);
                this.graph.dirtyCanvas = true;
                break;
            }
        }
    };
    GraphNode.prototype.addWidget = function (widget) {
        this.widgets.push(widget);
        this.graph.dirtyCanvas = true;
        return widget;
    };
    GraphNode.prototype.removeWidget = function (widget) {
        for (var i = 0; i < this.widgets.length; i++) {
            if (widget == this.widgets[i]) {
                this.widgets.splice(i, 1);
                this.graph.dirtyCanvas = true;
                break;
            }
        }
    };
    GraphNode.prototype.triggerOutput = function (index) {
        if (this.outputs.length >= index) {
            var output = this.outputs[index];
            for (var _i = 0, _a = output.connections; _i < _a.length; _i++) {
                var connection = _a[_i];
                if (connection.output == output) {
                    connection.input.properties.value = connection.output.properties.value;
                    connection.input.node.onTrigger();
                    connection.trigger();
                }
            }
        }
    };
    GraphNode.prototype.getInputData = function (index) {
        if (this.inputs.length >= index)
            return this.inputs[index].properties.value;
    };
    GraphNode.prototype.getOutputData = function (index) {
        if (this.outputs.length >= index)
            return this.outputs[index].properties.value;
    };
    GraphNode.prototype.setOutputData = function (index, data) {
        if (this.outputs.length >= index)
            this.outputs[index].properties.value = data;
    };
    GraphNode.prototype.connectInputToOutput = function (from, to) {
        if (!this.isValidConnection(to, from))
            return null;
        if (to.connection)
            to.node.removeConnection(to.connection);
        var connection = new GraphNodeConnection(to, from);
        to.setConnection(connection);
        from.addConnection(connection);
        from.node.onConnectionsChange(from, to);
        to.node.onConnectionsChange(from, to);
        return connection;
    };
    GraphNode.prototype.connect = function (outputIndex, targetNode, inputIndex) {
        if (targetNode.inputs.length < inputIndex || this.outputs.length < outputIndex)
            return null;
        var input = targetNode.inputs[inputIndex];
        var output = this.outputs[outputIndex];
        return this.connectInputToOutput(output, input);
    };
    GraphNode.prototype.isValidConnection = function (to, from) {
        if (to.properties.type != from.properties.type)
            return false;
        if (to.node == from.node)
            return false;
        return true;
    };
    GraphNode.prototype.removeConnection = function (connection) {
        connection.input.removeConnection();
        connection.output.removeConnection(connection);
    };
    GraphNode.prototype.disconnectInput = function (index) {
        if (this.inputs.length < index)
            return;
        if (this.inputs[index].connection) {
            this.removeConnection(this.inputs[index].connection);
        }
    };
    GraphNode.prototype.disconnectOutput = function (index, targetNode) {
        if (this.outputs.length < index)
            return;
        for (var _i = 0, _a = this.outputs[index].connections; _i < _a.length; _i++) {
            var connection = _a[_i];
            if (targetNode && connection.input.node == targetNode) {
                this.removeConnection(connection);
                break;
            }
            else {
                this.removeConnection(connection);
            }
        }
    };
    GraphNode.prototype.calculateNodeSize = function () {
        var headerSize = this.header.properties.size;
        var slotsSize = this.calculateSlotsSize();
        var widgetsSize = this.calculateWidgetsSize();
        var nodeSize = { w: 0, h: headerSize.h + slotsSize.h + widgetsSize.h + 5 };
        if (headerSize.w > nodeSize.w)
            nodeSize.w = headerSize.w;
        if (slotsSize.w > nodeSize.w)
            nodeSize.w = slotsSize.w;
        if (widgetsSize.w > nodeSize.w)
            nodeSize.w = widgetsSize.w;
        return { header: headerSize, slots: slotsSize, widgets: widgetsSize, node: nodeSize };
    };
    GraphNode.prototype.calculateSlotsSize = function () {
        // Inputs
        var inputsSize = { w: 0, h: 0 };
        if (!this.properties.horizontalSlots) {
            for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
                var input = _a[_i];
                if (input.properties.size.w > inputsSize.w)
                    inputsSize.w = input.properties.size.w;
                inputsSize.h += input.properties.size.h;
            }
        }
        // Outputs
        var outputsSize = { w: 0, h: 0 };
        if (!this.properties.horizontalSlots) {
            for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
                var output = _c[_b];
                if (output.properties.size.w > outputsSize.w)
                    outputsSize.w = output.properties.size.w;
                outputsSize.h += output.properties.size.h;
            }
        }
        return { w: inputsSize.w > outputsSize.w ? inputsSize.w : outputsSize.w, h: inputsSize.h > outputsSize.h ? inputsSize.h : outputsSize.h };
    };
    GraphNode.prototype.calculateWidgetsSize = function () {
        var widgetsSize = { w: 0, h: 0 };
        for (var _i = 0, _a = this.widgets; _i < _a.length; _i++) {
            var widget = _a[_i];
            if (widget.properties.size.w > widgetsSize.w)
                widgetsSize.w = widget.properties.size.w;
            widgetsSize.h += widget.properties.size.h + widget.properties.topMargin;
        }
        return widgetsSize;
    };
    GraphNode.prototype.drawConnections = function (ctx) {
        for (var _i = 0, _a = this.outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            for (var _b = 0, _c = output.connections; _b < _c.length; _b++) {
                var connection = _c[_b];
                connection.draw(ctx);
            }
        }
    };
    GraphNode.prototype.draw = function (ctx) {
        ctx.save();
        ctx.fillStyle = this.properties.color;
        var sizes = this.calculateNodeSize();
        this.properties.size = sizes.node;
        ctx.fillRect(this.properties.position.x, this.properties.position.y, this.properties.size.w, this.properties.size.h);
        // Header
        this.header.properties.size.w = sizes.node.w;
        this.header.properties.position = { x: this.properties.position.x, y: this.properties.position.y };
        this.header.draw(ctx);
        var nodeContentPosition = { x: this.properties.position.x, y: this.properties.position.y + this.header.properties.size.h };
        // Inputs
        var inputsY = nodeContentPosition.y;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.properties.horizontalSlots) {
                this.inputs[i].properties.position = { x: this.properties.position.x + (i + 0.5) * (this.properties.size.w / this.inputs.length), y: this.properties.position.y - 10 };
            }
            else {
                this.inputs[i].properties.position = { x: this.properties.position.x, y: inputsY };
                this.inputs[i].draw(ctx);
                inputsY += this.inputs[i].properties.size.h;
            }
            this.inputs[i].draw(ctx);
        }
        // Outputs
        var outputsY = nodeContentPosition.y;
        for (var i = 0; i < this.outputs.length; i++) {
            if (this.properties.horizontalSlots) {
                var x = (i + 0.5) * (this.properties.size.w / this.outputs.length);
                this.outputs[i].properties.position = { x: this.properties.position.x - this.properties.size.w + x, y: this.properties.position.y + this.properties.size.h - 10 };
            }
            else {
                this.outputs[i].properties.position = { x: this.properties.position.x, y: outputsY };
                this.outputs[i].draw(ctx);
                outputsY += this.outputs[i].properties.size.h;
            }
            this.outputs[i].draw(ctx);
        }
        // Widgets
        var widgetsY = nodeContentPosition.y + sizes.slots.h;
        for (var i = 0; i < this.widgets.length; i++) {
            this.widgets[i].properties.position = { x: this.properties.position.x, y: widgetsY + this.widgets[i].properties.topMargin };
            if (this.widgets[i].draw)
                this.widgets[i].draw(ctx);
            widgetsY += this.widgets[i].properties.size.h + this.widgets[i].properties.topMargin;
        }
        ctx.restore();
    };
    return GraphNode;
}());
export { GraphNode };
//# sourceMappingURL=GraphNode.js.map