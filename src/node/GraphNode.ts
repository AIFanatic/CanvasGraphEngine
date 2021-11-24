import { NodeProperties } from "../defaults/NodeProperties";
import { Graph } from "../Graph";
import { GraphNodeConnection } from "./GraphNodeConnection";
import { GraphNodeInput } from "./slot/GraphNodeInput";
import { GraphNodeOutput } from "./slot/GraphNodeOutput";
import { INodeProperties } from "../interfaces/INodeProperties";
import { INodeWidget } from "../interfaces/INodeWidget";
import { IPosition } from "../interfaces/IPosition";
import { ISize } from "../interfaces/ISize";

import { NodeHeaderWidget } from "../widgets/NodeHeaderWidget";
import { IMouseEvent, MouseEventTypes } from "../interfaces/IMouseEvent";

export class GraphNode {
    public graph: Graph;
    
    public inputs: GraphNodeInput[] = [];
    public outputs: GraphNodeOutput[] = [];
    public widgets: INodeWidget[] = [];
    
    public properties: INodeProperties;

    public header: NodeHeaderWidget;

    public onTrigger(from: GraphNodeConnection) {};
    public onConnectionsChange(from: GraphNodeOutput, to: GraphNodeInput) {};
    public onAdded() {};
    public onRemoved() {};
    public onSerialize() {};
    public onDeserialized() {};
    
    public onMouseUp(event: IMouseEvent) {};
    public onMouseDown(event: IMouseEvent) {};
    public onMouseMove(event: IMouseEvent) {};
    public onMouseWheel(event: IMouseEvent) {};

    constructor(graph: Graph, path: string, title?: string) {
        this.graph = graph;
        this.properties = NodeProperties.default();
        this.properties.path = path;

        this.header = new NodeHeaderWidget(title ? title : "");
    }

    public addInput(name: string, type: string): GraphNodeInput {
        const input = new GraphNodeInput(this);
        input.properties.name = name;
        input.properties.type = type;
        this.inputs.push(input);
        this.graph.dirtyCanvas = true;
        return input;
    }

    public addOutput(name: string, type: string): GraphNodeOutput {
        const output = new GraphNodeOutput(this);
        output.properties.name = name;
        output.properties.type = type;
        this.outputs.push(output);
        this.graph.dirtyCanvas = true;
        return output;
    }

    public removeInput(input: GraphNodeInput) {
        for (let i = 0; i < this.inputs.length; i++) {
            if (input == this.inputs[i]) {
                this.inputs.splice(i,1);
                this.graph.dirtyCanvas = true;
                break;
            }
        }
    }

    public removeOutput(output: GraphNodeOutput) {
        for (let i = 0; i < this.outputs.length; i++) {
            if (output == this.outputs[i]) {
                this.outputs.splice(i,1);
                this.graph.dirtyCanvas = true;
                break;
            }
        }
    }

    public getInputByUuid(uuid: string): GraphNodeInput {
        for (let input of this.inputs) {
            if (input.properties.uuid == uuid) return input;
        }
        return null;
    }
    
    public getOutputByUuid(uuid: string): GraphNodeOutput {
        for (let output of this.outputs) {
            if (output.properties.uuid == uuid) return output;
        }
        return null;
    }

    public addWidget(widget: INodeWidget): INodeWidget {
        this.widgets.push(widget);
        this.graph.dirtyCanvas = true;
        return widget;
    }

    public removeWidget(widget: INodeWidget) {
        for (let i = 0; i < this.widgets.length; i++) {
            if (widget == this.widgets[i]) {
                this.widgets.splice(i,1);
                this.graph.dirtyCanvas = true;
                break;
            }
        }
    }

    public triggerOutput(index: number) {
        if (this.outputs.length >= index) {
            const output = this.outputs[index];

            for (let connection of output.connections) {
                if (connection.output == output) {
                    connection.input.properties.value = connection.output.properties.value;
                    connection.input.node.onTrigger(connection);
                    connection.trigger();
                }
            }
        }
    }

    public getInputData(index: number): any {
        if (this.inputs.length >= index) return this.inputs[index].properties.value;
    }
    
    public getOutputData(index: number): any {
        if (this.outputs.length >= index) return this.outputs[index].properties.value;
    }

    public setOutputData(index: number, data: any) {
        if (this.outputs.length >= index) this.outputs[index].properties.value = data;
    }

    public connectInputToOutput(from: GraphNodeOutput, to: GraphNodeInput): GraphNodeConnection {
        if (!this.isValidConnection(to, from)) return null;

        if (to.connection) to.node.removeConnection(to.connection);

        const connection = new GraphNodeConnection(to, from);
        to.setConnection(connection);
        from.addConnection(connection);

        from.node.onConnectionsChange(from, to);
        to.node.onConnectionsChange(from, to);

        return connection;
    }

    public connect(outputIndex: number, targetNode: GraphNode, inputIndex: number): GraphNodeConnection {
        if (targetNode.inputs.length < inputIndex || this.outputs.length < outputIndex) return null;

        const input = targetNode.inputs[inputIndex];
        const output = this.outputs[outputIndex];

        return this.connectInputToOutput(output, input);
    }

    public isValidConnection(to: GraphNodeInput, from: GraphNodeOutput): boolean {
        if (!to || !from) return false;
        if (to.properties.type != from.properties.type) return false;
        if (to.node == from.node) return false;
        return true;
    }

    public removeConnection(connection: GraphNodeConnection) {
        connection.input.removeConnection();
        connection.output.removeConnection(connection);
    }

    public disconnectInput(index: number) {
        if (this.inputs.length < index)  return;

        if (this.inputs[index].connection) {
            this.removeConnection(this.inputs[index].connection);
        }
    }

    public disconnectOutput(index: number, targetNode?: GraphNode) {
        if (this.outputs.length < index) return;
        
        for (let connection of this.outputs[index].connections) {
            if (targetNode && connection.input.node == targetNode) {
                this.removeConnection(connection);
                break;
            }
            else {
                this.removeConnection(connection);
            }
        }
    }

    private calculateNodeSize(): {header: ISize, slots: ISize, widgets: ISize, node: ISize} {
        const headerSize = this.header.properties.size;
        const slotsSize = this.calculateSlotsSize();
        const widgetsSize = this.calculateWidgetsSize();

        let nodeSize: ISize = {w: 0, h: headerSize.h + slotsSize.h + widgetsSize.h + 5};
        if (headerSize.w > nodeSize.w) nodeSize.w = headerSize.w;
        if (slotsSize.w > nodeSize.w) nodeSize.w = slotsSize.w;
        if (widgetsSize.w > nodeSize.w) nodeSize.w = widgetsSize.w;

        return {header: headerSize, slots: slotsSize, widgets: widgetsSize, node: nodeSize};
    }

    private calculateSlotsSize(): ISize {
        // Inputs
        let inputsSize: ISize = {w: 0, h: 0};
        if (!this.properties.horizontalSlots) {
            for (let input of this.inputs) {
                if (input.properties.size.w > inputsSize.w) inputsSize.w = input.properties.size.w;
                inputsSize.h += input.properties.size.h;
            }
        }

        // Outputs
        let outputsSize: ISize = {w: 0, h: 0};
        if (!this.properties.horizontalSlots) {
            for (let output of this.outputs) {
                if (output.properties.size.w > outputsSize.w) outputsSize.w = output.properties.size.w;
                outputsSize.h += output.properties.size.h;
            }
        }

        return {w: inputsSize.w > outputsSize.w ? inputsSize.w : outputsSize.w, h: inputsSize.h > outputsSize.h ? inputsSize.h : outputsSize.h};
    }

    private calculateWidgetsSize(): ISize {
        let widgetsSize: ISize = {w: 0, h: 0};
        for (let widget of this.widgets) {
            if (widget.properties.size.w > widgetsSize.w) widgetsSize.w = widget.properties.size.w;
            widgetsSize.h += widget.properties.size.h + widget.properties.topMargin;
        }

        return widgetsSize;
    }

    public drawConnections(ctx: CanvasRenderingContext2D) {
        for (let output of this.outputs) {
            for (let connection of output.connections) {
                connection.draw(ctx);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = this.properties.color;

        const sizes = this.calculateNodeSize();
        this.properties.size = sizes.node;

        ctx.fillRect(this.properties.position.x, this.properties.position.y, this.properties.size.w, this.properties.size.h);

        // Header
        this.header.properties.size.w = sizes.node.w;
        this.header.properties.position = {x: this.properties.position.x, y: this.properties.position.y};
        this.header.draw(ctx);

        const nodeContentPosition: IPosition = {x: this.properties.position.x, y: this.properties.position.y + this.header.properties.size.h};
        
        // Inputs
        let inputsY = nodeContentPosition.y;
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.properties.horizontalSlots) {
                this.inputs[i].properties.position = {x: this.properties.position.x + (i + 0.5) * (this.properties.size.w / this.inputs.length), y: this.properties.position.y - 10};
            }
            else {
                this.inputs[i].properties.position = {x: this.properties.position.x, y: inputsY};
                this.inputs[i].draw(ctx);
                inputsY += this.inputs[i].properties.size.h;
            }
            this.inputs[i].draw(ctx);
        }

        // Outputs
        let outputsY = nodeContentPosition.y;
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.properties.horizontalSlots) {
                const x = (i + 0.5) * (this.properties.size.w / this.outputs.length);
                this.outputs[i].properties.position = {x: this.properties.position.x - this.properties.size.w + x, y: this.properties.position.y + this.properties.size.h - 10};
            }
            else {
                this.outputs[i].properties.position = {x: this.properties.position.x, y: outputsY};
                this.outputs[i].draw(ctx);
                outputsY += this.outputs[i].properties.size.h;
            }
            this.outputs[i].draw(ctx);
        }

        // Widgets
        let widgetsY = nodeContentPosition.y + sizes.slots.h;
        for (let i = 0; i < this.widgets.length; i++) {
            this.widgets[i].properties.position = {x: this.properties.position.x, y: widgetsY + this.widgets[i].properties.topMargin};
            if (this.widgets[i].draw) this.widgets[i].draw(ctx);
            widgetsY += this.widgets[i].properties.size.h + this.widgets[i].properties.topMargin;
        }

        ctx.restore();
    }

    public onMouseEvent = (event: IMouseEvent, type: MouseEventTypes) => {
        if (type == MouseEventTypes.UP && this.onMouseUp) this.onMouseUp(event);
        else if (type == MouseEventTypes.DOWN && this.onMouseDown) this.onMouseDown(event);
        else if (type == MouseEventTypes.MOVE && this.onMouseMove) this.onMouseMove(event);
        else if (type == MouseEventTypes.WHEEL && this.onMouseWheel) this.onMouseWheel(event);

        for (let widget of this.widgets) {
            if (type == MouseEventTypes.UP && widget.onMouseUp) widget.onMouseUp(event);
            else if (type == MouseEventTypes.DOWN && widget.onMouseDown) widget.onMouseDown(event);
            else if (type == MouseEventTypes.MOVE && widget.onMouseMove) widget.onMouseMove(event);
            else if (type == MouseEventTypes.WHEEL && widget.onMouseWheel) widget.onMouseWheel(event);
        }
    };
}