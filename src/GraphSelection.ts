import { NodeConnectionProperties } from "./defaults/NodeConnectionProperties";
import { Graph } from "./Graph";
import { GraphNode } from "./node/GraphNode";
import { GraphNodeInput } from "./node/slot/GraphNodeInput";
import { GraphNodeOutput } from "./node/slot/GraphNodeOutput";
import { INodeConnectionProperties } from "./interfaces/INodeConnectionProperties";
import { IPosition } from "./interfaces/IPosition";
import { Utils } from "./Utils";
import { IMouseEvent, MouseButton } from "./interfaces/IMouseEvent";

export class GraphSelection {
    public connectionProperties: INodeConnectionProperties;

    private graph: Graph;
    private selectedNode: GraphNode;
    private selectedSlotFrom: GraphNodeOutput;
    private selectedSlotTo: GraphNodeInput;
    private selectedNodePositionOffset: IPosition;
    private mousePosition: IPosition;
    private slotRadiusMultiplier: number = 2;
    private isMouseDown: boolean;

    constructor(graph: Graph) {
        this.graph = graph;

        this.connectionProperties = NodeConnectionProperties.default();
        this.mousePosition = {x: 0, y: 0};
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        if (this.selectedNode && !this.selectedSlotFrom) {
            ctx.strokeStyle = "#949494";
            ctx.strokeRect(this.selectedNode.properties.position.x, this.selectedNode.properties.position.y, this.selectedNode.properties.size.w, this.selectedNode.properties.size.h);
        }
        if (this.selectedSlotFrom) {
            ctx.strokeStyle = this.connectionProperties.color == "inherit" ? this.selectedSlotFrom.properties.slotColor : this.connectionProperties.color;
            ctx.lineWidth = this.connectionProperties.thickness;
            ctx.beginPath();
            ctx.moveTo(this.selectedSlotFrom.slotCenter.x, this.selectedSlotFrom.slotCenter.y);
            ctx.lineTo(this.mousePosition.x, this.mousePosition.y);
            ctx.stroke();
        }
        ctx.restore();
    }

    private bringNodeToForeground(node: GraphNode) {
        const nodeIndex = this.graph.nodes.indexOf(node);
        if (nodeIndex != -1) {
            const foregroundNode = this.graph.nodes.splice(nodeIndex, 1)[0];
            this.graph.nodes.push(foregroundNode);
        }
    }

    public onMouseDown(event: IMouseEvent) {
        if (event.button == MouseButton.RIGHT) return;
        if (event.rawEvent instanceof TouchEvent && event.rawEvent.touches.length > 1) {
            this.selectedNode = null;
            return;
        }
        
        this.mousePosition = event.position;
        this.isMouseDown = true;

        if (this.selectedNode) {
            if (!Utils.isPointInsideRect(this.selectedNode.properties.position, this.selectedNode.properties.size, event.position)) {
                this.selectedNode = null;
            }
        }
        for (let node of this.graph.nodes) {
            if (Utils.isPointInsideRect(node.properties.position, node.properties.size, event.position)) {
                this.selectedNode = node;
                this.selectedNodePositionOffset = {x: event.position.x - this.selectedNode.properties.position.x, y: event.position.y - this.selectedNode.properties.position.y};
                this.bringNodeToForeground(this.selectedNode);
                
                for (let output of node.outputs) {
                    const isSlotSelected = Utils.isPointInsideCircle(event.position, output.slotCenter, output.properties.slotRadius * this.slotRadiusMultiplier);

                    if (isSlotSelected) {
                        this.selectedSlotFrom = output;
                        break;
                    }
                }

                for (let input of node.inputs) {
                    if (input.connection) {
                        const isSlotSelected = Utils.isPointInsideCircle(event.position, input.slotCenter, input.properties.slotRadius * this.slotRadiusMultiplier);
    
                        if (isSlotSelected) {
                            input.node.removeConnection(input.connection);
                            break;
                        }
                    }
                }
            }
        }
    }

    public onMouseUp(event: IMouseEvent) {
        this.mousePosition = event.position;
        this.isMouseDown = false;
        if (this.selectedNode && this.selectedSlotFrom && this.selectedSlotTo) {
            this.selectedSlotTo.isHighlighted = false;
            this.selectedNode.connectInputToOutput(this.selectedSlotFrom, this.selectedSlotTo);
        }

        // this.selectedNode = null;
        this.selectedSlotFrom = null;
        this.selectedSlotTo = null;
    }

    public onMouseMove(event: IMouseEvent): boolean {
        this.mousePosition = event.position;
        this.selectedSlotTo = null;
        
        if (this.selectedSlotFrom) {
            for (let node of this.graph.nodes) {
                if (node == this.selectedNode) continue;

                if (Utils.isPointInsideRect(node.properties.position, node.properties.size, event.position)) {
                    document.body.style.cursor = "pointer";
                    for (let input of node.inputs) {
                        input.isHighlighted = false;

                        const isMouseInsideSlot = Utils.isPointInsideCircle(event.position, input.slotCenter, input.properties.slotRadius * this.slotRadiusMultiplier);
    
                        if (isMouseInsideSlot) {
                            if (this.selectedNode.isValidConnection(input, this.selectedSlotFrom)) {
                                input.isHighlighted = true;
                                this.selectedSlotTo = input;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (this.selectedNode && !this.selectedSlotFrom && this.isMouseDown) {
            this.selectedNode.properties.position.x = event.position.x - this.selectedNodePositionOffset.x;
            this.selectedNode.properties.position.y = event.position.y - this.selectedNodePositionOffset.y;
        }

        if (this.selectedNode || this.selectedSlotFrom || this.selectedSlotTo) {
            return false;
        }
        return true;
    }
}