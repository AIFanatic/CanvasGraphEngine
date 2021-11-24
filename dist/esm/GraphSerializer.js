var GraphSerializer = /** @class */ (function () {
    function GraphSerializer() {
    }
    GraphSerializer.serializeNodeInputs = function (inputs) {
        var json = [];
        for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
            var input = inputs_1[_i];
            json.push(input.properties);
        }
        return json;
    };
    GraphSerializer.serializeNodeOutputs = function (outputs) {
        var json = [];
        for (var _i = 0, outputs_1 = outputs; _i < outputs_1.length; _i++) {
            var output = outputs_1[_i];
            var obj = { properties: output.properties, connections: [] };
            for (var _a = 0, _b = output.connections; _a < _b.length; _a++) {
                var connection = _b[_a];
                obj.connections.push(connection.properties);
            }
            json.push(obj);
        }
        return json;
    };
    GraphSerializer.serializeWidgets = function (widgets) {
        var json = [];
        for (var _i = 0, widgets_1 = widgets; _i < widgets_1.length; _i++) {
            var widget = widgets_1[_i];
            json.push(widget.properties);
        }
        return json;
    };
    GraphSerializer.serializeNode = function (node) {
        return {
            node: node.properties,
            header: node.header.properties,
            inputs: this.serializeNodeInputs(node.inputs),
            outputs: this.serializeNodeOutputs(node.outputs),
            widgets: this.serializeWidgets(node.widgets)
        };
    };
    GraphSerializer.toJSON = function (graph) {
        var json = [];
        for (var _i = 0, _a = graph.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            json.push(GraphSerializer.serializeNode(node));
        }
        // Lazy deep copy
        return JSON.parse(JSON.stringify(json));
    };
    GraphSerializer.fromJSON = function (graph, serialized) {
        // Create nodes, inputs and outputs
        var nodes = new Map();
        var inputs = new Map();
        var outputs = new Map();
        for (var _i = 0, serialized_1 = serialized; _i < serialized_1.length; _i++) {
            var nodeEntry = serialized_1[_i];
            var nodeInstance = graph.createNode(nodeEntry.node.path);
            if (nodeInstance) {
                nodeInstance.properties = nodeEntry.node;
                nodeInstance.header.properties = nodeEntry.header;
                for (var _a = 0, _b = nodeEntry.inputs; _a < _b.length; _a++) {
                    var input = _b[_a];
                    var inputInstance = nodeInstance.addInput(input.name, input.type);
                    inputInstance.properties = input;
                    inputs.set(inputInstance.properties.uuid, inputInstance);
                }
                for (var _c = 0, _d = nodeEntry.outputs; _c < _d.length; _c++) {
                    var output = _d[_c];
                    var outputInstance = nodeInstance.addOutput(output.properties.name, output.properties.type);
                    outputInstance.properties = output.properties;
                    outputs.set(outputInstance.properties.uuid, outputInstance);
                }
                nodes.set(nodeInstance.properties.uuid, nodeInstance);
            }
        }
        // Create connections
        for (var _e = 0, serialized_2 = serialized; _e < serialized_2.length; _e++) {
            var nodeEntry = serialized_2[_e];
            var nodeInstance = nodes.get(nodeEntry.node.uuid);
            for (var _f = 0, _g = nodeEntry.outputs; _f < _g.length; _f++) {
                var output = _g[_f];
                for (var _h = 0, _j = output.connections; _h < _j.length; _h++) {
                    var connection = _j[_h];
                    var inputInstance = inputs.get(connection.to_slot);
                    var outputInstance = outputs.get(connection.from_slot);
                    nodeInstance.connectInputToOutput(outputInstance, inputInstance);
                }
            }
        }
    };
    return GraphSerializer;
}());
export { GraphSerializer };
//# sourceMappingURL=GraphSerializer.js.map