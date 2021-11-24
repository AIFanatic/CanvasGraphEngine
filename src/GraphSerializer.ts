import { GraphNode } from ".";
import { NodeWidgetProperties } from "./defaults/NodeWidgetProperties";
import { Graph } from "./Graph";
import { GraphNodeInput } from "./node/slot/GraphNodeInput";
import { GraphNodeOutput } from "./node/slot/GraphNodeOutput";
import { INodeProperties } from "./interfaces/INodeProperties";
import { INodeWidget } from "./interfaces/INodeWidget";
import { INodeSlotProperties } from "./interfaces/INodeSlotProperties";
import { INodeWidgetProperties } from "./interfaces/INodeWidgetProperties";
import { INodeConnectionProperties } from "./interfaces/INodeConnectionProperties";

interface IGraphSerializeOutput {
    properties: INodeSlotProperties;
    connections: INodeConnectionProperties[]
}

export interface IGraphSerializeNode {
    node: INodeProperties,
    header: INodeWidgetProperties,
    inputs: INodeSlotProperties[],
    outputs: IGraphSerializeOutput[],
    widgets: NodeWidgetProperties[]
}

export class GraphSerializer {
    private static serializeNodeInputs(inputs: GraphNodeInput[]): INodeSlotProperties[] {
        let json: INodeSlotProperties[] = [];
        for (let input of inputs) {
            json.push(input.properties);
        }
        return json;
    }

    private static serializeNodeOutputs(outputs: GraphNodeOutput[]): IGraphSerializeOutput[] {
        let json: IGraphSerializeOutput[] = [];
        for (let output of outputs) {
            let obj: IGraphSerializeOutput = {properties: output.properties, connections: []};

            for (let connection of output.connections) {
                obj.connections.push(connection.properties)
            }
            json.push(obj);
        }
        return json;
    }

    private static serializeWidgets(widgets: INodeWidget[]): NodeWidgetProperties[] {
        let json: NodeWidgetProperties[] = [];
        for (let widget of widgets) json.push(widget.properties);
        return json;
    }

    private static serializeNode(node: GraphNode): IGraphSerializeNode {
        return {
            node: node.properties,
            header: node.header.properties,
            inputs: this.serializeNodeInputs(node.inputs),
            outputs: this.serializeNodeOutputs(node.outputs),
            widgets: this.serializeWidgets(node.widgets)
        };
    }
    
    public static toJSON(graph: Graph): IGraphSerializeNode[] {
        let json: IGraphSerializeNode[] = [];
        for (let node of graph.nodes) {
            node.onSerialize();
            json.push(GraphSerializer.serializeNode(node));
        }

        // Lazy deep copy
        return JSON.parse(JSON.stringify(json));
    }

    public static fromJSON(graph: Graph, serialized: IGraphSerializeNode[]) {
        // Clear graph
        graph.clearNodes();
        
        // Create nodes, inputs and outputs
        let nodes: Map<string, GraphNode> = new Map();
        let inputs: Map<string, GraphNodeInput> = new Map();
        let outputs: Map<string, GraphNodeOutput> = new Map();

        for (let nodeEntry of serialized) {
            const nodeInstance = graph.createNode(nodeEntry.node.path);
            if (nodeInstance) {
                nodeInstance.properties = nodeEntry.node;
                nodeInstance.header.properties = nodeEntry.header;

                // if (nodeInstance.inputs.length >= nodeEntry.inputs.length) {
                //     for (let i = 0; i < nodeEntry.inputs.length; i++) {
                //         const inputProperties = nodeEntry.inputs[i];
                //         const inputInstance = nodeInstance.inputs[i];
                //         inputInstance.properties = inputProperties;
                //         inputs.set(inputInstance.properties.uuid, inputInstance);
                //     }
                // }

                // if (nodeInstance.outputs.length >= nodeEntry.outputs.length) {
                //     for (let i = 0; i < nodeEntry.outputs.length; i++) {
                //         const outputProperties = nodeEntry.outputs[i];
                //         const outputInstance = nodeInstance.outputs[i];
                //         outputInstance.properties = outputProperties.properties;
                //         outputs.set(outputInstance.properties.uuid, outputInstance);
                //     }
                // }
                for (let i = 0; i < nodeEntry.inputs.length; i++) {
                    const inputEntry = nodeEntry.inputs[i];
                    const inputInstance = nodeInstance.inputs[i] ? nodeInstance.inputs[i] : nodeInstance.addInput(inputEntry.name, inputEntry.type);
                    inputInstance.properties = inputEntry;
                    inputs.set(inputInstance.properties.uuid, inputInstance);
                }

                for (let i = 0; i < nodeEntry.outputs.length; i++) {
                    const outputEntry = nodeEntry.outputs[i];
                    const outputInstance = nodeInstance.outputs[i] ? nodeInstance.outputs[i] : nodeInstance.addOutput(outputEntry.properties.name, outputEntry.properties.type);
                    outputInstance.properties = outputEntry.properties;
                    outputs.set(outputInstance.properties.uuid, outputInstance);
                }

                nodes.set(nodeInstance.properties.uuid, nodeInstance);
            }
        }

        // Create connections
        for (let nodeEntry of serialized) {
            const nodeInstance = nodes.get(nodeEntry.node.uuid);
            for (let output of nodeEntry.outputs) {
                for (let connection of output.connections) {
                    const inputInstance = inputs.get(connection.to_slot);
                    const outputInstance = outputs.get(connection.from_slot);

                    nodeInstance.connectInputToOutput(outputInstance, inputInstance);
                }
            }
            // Broadcast event
            nodeInstance.onDeserialized();
        }
    }
}