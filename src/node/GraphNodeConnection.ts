import { NodeConnectionProperties } from "../defaults/NodeConnectionProperties";
import { GraphNodeInput } from "./slot/GraphNodeInput";
import { GraphNodeOutput } from "./slot/GraphNodeOutput";
import { INodeConnectionProperties } from "../interfaces/INodeConnectionProperties";

export class GraphNodeConnection {
    public input: GraphNodeInput;
    public output: GraphNodeOutput;

    public properties: INodeConnectionProperties;

    private hasTriggered: boolean;
    private dashOffset: number = 0;

    constructor(input: GraphNodeInput, output: GraphNodeOutput) {
        this.input = input;
        this.output = output;

        const propertiesDefaults = NodeConnectionProperties.default();
        this.properties = {
            color: propertiesDefaults.color,
            thickness: propertiesDefaults.thickness,
            from_node: this.output.node.properties.uuid,
            from_slot: this.output.properties.uuid,
            to_node: this.input.node.properties.uuid,
            to_slot: this.input.properties.uuid
        }
    }

    public trigger() {
        if (this.hasTriggered) return;

        this.hasTriggered = true;
        this.dashOffset = 0;
        
        const interval = setInterval(() => {
            this.output.node.graph.dirtyCanvas = true;
            this.dashOffset--;
        }, 100);
        setTimeout(() => {
            this.hasTriggered = false;
            clearInterval(interval);
        }, 1000);
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Slot centers not set, refresh canvas until they are
        if ((this.input.slotCenter.x == 0 && this.input.slotCenter.y == 0) ||
            (this.output.slotCenter.x == 0 && this.output.slotCenter.y == 0)) {
            this.output.node.graph.dirtyCanvas = true;
            return;
        }

        ctx.save();
        ctx.strokeStyle = this.properties.color == "inherit" ? this.input.properties.slotColor : this.properties.color;

        
        if (this.hasTriggered) {
            ctx.strokeStyle = "white";
            ctx.setLineDash([4, 4]);
            ctx.lineDashOffset = this.dashOffset;
        }
        
        ctx.lineWidth = this.properties.thickness;

        ctx.beginPath();
        ctx.moveTo(this.output.slotCenter.x, this.output.slotCenter.y);

        const outputIsVertical = this.output.node.properties.horizontalSlots;
        const inputIsVertical = this.input.node.properties.horizontalSlots;

        if (outputIsVertical && inputIsVertical) {
            ctx.lineTo(this.output.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
            ctx.lineTo(this.input.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
        }
        else if (!outputIsVertical && inputIsVertical) {
            ctx.lineTo(this.input.slotCenter.x, this.output.slotCenter.y);
            ctx.lineTo(this.input.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
        }
        else if (outputIsVertical && !inputIsVertical) {
            ctx.lineTo(this.output.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
            ctx.lineTo(this.output.slotCenter.x, this.input.slotCenter.y);
        }
        else if (!outputIsVertical && !inputIsVertical) {
            ctx.lineTo((this.output.slotCenter.x + this.input.slotCenter.x) * 0.5, this.output.slotCenter.y);
            ctx.lineTo((this.output.slotCenter.x + this.input.slotCenter.x) * 0.5, this.input.slotCenter.y);
        }

        ctx.lineTo(this.input.slotCenter.x, this.input.slotCenter.y);

        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }
}