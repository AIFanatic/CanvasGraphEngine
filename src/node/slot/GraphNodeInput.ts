import { NodeSlotProperties } from "../../defaults/NodeSlotProperties";
import { GraphNode } from "../GraphNode";
import { GraphNodeConnection } from "../GraphNodeConnection";
import { INodeSlotProperties } from "../../interfaces/INodeSlotProperties";
import { IPosition } from "../../interfaces/IPosition";

export class GraphNodeInput {
    public properties: INodeSlotProperties;
    public slotCenter: IPosition;
    public node: GraphNode;
    public connection: GraphNodeConnection = null;

    public isHighlighted: boolean;
    
    constructor(node: GraphNode) {
        this.properties = NodeSlotProperties.default();

        this.properties.name = "input"
        this.slotCenter = {x: 0, y: 0};
        this.node = node;
    }

    public removeConnection() {
        this.connection = null;
    }

    public setConnection(connection: GraphNodeConnection) {
        this.connection = connection;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        const margin = this.node.properties.horizontalSlots ? 0 : this.properties.margin;
        this.slotCenter = {x: this.properties.position.x + margin, y: this.properties.position.y + this.properties.size.h / 2};

        if (this.isHighlighted) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
        }
        else {
            ctx.fillStyle = this.properties.slotColor;
            ctx.strokeStyle = this.properties.slotColor;    
        }

        ctx.beginPath();
        ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();

        if (this.connection) {
            ctx.beginPath();
            ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius-2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }

        ctx.fillStyle = this.properties.textColor;
        ctx.font = "9pt Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle"
        ctx.fillText(this.properties.name, this.slotCenter.x + 10, this.slotCenter.y);

        ctx.restore();
    }
}