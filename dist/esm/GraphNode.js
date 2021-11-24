import { NodeProperties } from "./defaults/NodeProperties";
import { GraphNodeConnection } from "./GraphNodeConnection";
import { GraphNodeInput } from "./GraphNodeInput";
import { GraphNodeOutput } from "./GraphNodeOutput";
import { HeaderWidget } from "./widgets/HeaderWidget";
var GraphNode = /** @class */ (function () {
    function GraphNode(graph, title) {
        this.inputs = [];
        this.outputs = [];
        this.widgets = [];
        this.graph = graph;
        this.properties = NodeProperties.default();
        this.header = new HeaderWidget(title);
    }
    GraphNode.prototype.onAction = function () { };
    ;
    GraphNode.prototype.onConnectionsChange = function (from, to) { };
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
                    connection.input.node.onAction();
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
    GraphNode.prototype.connect = function (from, to) {
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
        var nodeSize = { w: 0, h: headerSize.h + slotsSize.h + widgetsSize.h };
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
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            if (input.properties.size.w > inputsSize.w)
                inputsSize.w = input.properties.size.w;
            inputsSize.h += input.properties.size.h;
        }
        // Outputs
        var outputsSize = { w: 0, h: 0 };
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            if (output.properties.size.w > outputsSize.w)
                outputsSize.w = output.properties.size.w;
            outputsSize.h += output.properties.size.h;
        }
        return { w: inputsSize.w > outputsSize.w ? inputsSize.w : outputsSize.w, h: inputsSize.h > outputsSize.h ? inputsSize.h : outputsSize.h };
    };
    GraphNode.prototype.calculateWidgetsSize = function () {
        var widgetsSize = { w: 0, h: 0 };
        for (var _i = 0, _a = this.widgets; _i < _a.length; _i++) {
            var widget = _a[_i];
            if (widget.properties.size.w > widgetsSize.w)
                widgetsSize.w = widget.properties.size.w;
            widgetsSize.h += widget.properties.size.h;
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
        this.header.draw(ctx, this.properties.position.x, this.properties.position.y);
        var nodeContentPosition = { x: this.properties.position.x, y: this.properties.position.y + this.header.properties.size.h };
        // Inputs
        var inputsY = nodeContentPosition.y;
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].draw(ctx, this.properties.position.x, inputsY);
            inputsY += this.inputs[i].properties.size.h;
        }
        // Outputs
        var outputY = nodeContentPosition.y;
        for (var i = 0; i < this.outputs.length; i++) {
            this.outputs[i].draw(ctx, this.properties.position.x, outputY);
            outputY += this.outputs[i].properties.size.h;
        }
        // Widgets
        var widgetsY = nodeContentPosition.y + sizes.slots.h;
        for (var i = 0; i < this.widgets.length; i++) {
            this.widgets[i].draw(ctx, this.properties.position.x, widgetsY);
            widgetsY += this.widgets[i].properties.size.h;
        }
        ctx.restore();
    };
    return GraphNode;
}());
export { GraphNode };
//# sourceMappingURL=GraphNode.js.map